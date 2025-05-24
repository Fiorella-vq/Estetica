from flask import Blueprint, request, jsonify, current_app
from api.models import db, Reserva
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from functools import wraps
import jwt

# --- CONFIGURACIÓN DEL BLUEPRINT Y CORS ---
api = Blueprint('api', __name__)
CORS(api, origins=["http://localhost:3000"], supports_credentials=True)

# --- CONFIGURACIÓN JWT ---
SECRET_KEY = os.getenv('SECRET_KEY', 'mi_clave_secreta_super_segura')

def generar_jwt(payload, expiracion_minutos=60):
    payload['exp'] = datetime.utcnow() + timedelta(minutes=expiracion_minutos)
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verificar_jwt(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        current_app.logger.warning("Token JWT expirado.")
        return None
    except jwt.InvalidTokenError as e:
        current_app.logger.error(f"Token JWT inválido: {e}")
        return None

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token faltante o mal formado'}), 401
        
        token = auth_header[7:]
        decoded = verificar_jwt(token)
        if not decoded or decoded.get('role') != 'admin':
            return jsonify({'error': 'Token inválido o no autorizado'}), 401
        
        return f(*args, **kwargs)
    return wrapper

# --- FUNCIONES UTILITARIAS ---
def generate_token(length=32):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def enviar_email_smtp(destino, asunto, mensaje):
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))

    if not smtp_user or not smtp_pass:
        current_app.logger.error("Credenciales SMTP no configuradas.")
        return False, "Credenciales SMTP no configuradas"

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = destino
    msg['Subject'] = asunto
    msg.attach(MIMEText(mensaje, 'plain'))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, destino, msg.as_string())
        server.quit()
        current_app.logger.info(f"Correo enviado a {destino}.")
        return True, "Correo enviado"
    except Exception as e:
        current_app.logger.error(f"Error enviando correo a {destino}: {e}")
        return False, str(e)

# --- RUTAS PÚBLICAS ---
@api.route('/reservas', methods=['POST'])
def crear_reserva():
    data = request.get_json()
    required_fields = ['nombre', 'email', 'telefono', 'fecha', 'hora', 'servicio']
    if not data or not all(data.get(field) for field in required_fields):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    try:
        fecha = datetime.strptime(data['fecha'], '%Y-%m-%d').date()
        hora = datetime.strptime(data['hora'], '%H:%M').time()
    except ValueError:
        return jsonify({'error': 'Formato de fecha u hora inválido'}), 400

    if fecha < datetime.now().date():
        return jsonify({'error': 'No se pueden hacer reservas en el pasado'}), 400

    reserva_existente = Reserva.query.filter_by(fecha=fecha, hora=hora, cancelada=False).first()
    if reserva_existente:
        return jsonify({'error': 'Ya existe una reserva en esa fecha y hora'}), 409

    token = generate_token()
    reserva = Reserva(
        nombre=data['nombre'],
        email=data['email'],
        telefono=data['telefono'],
        fecha=fecha,
        hora=hora,
        servicio=data['servicio'],
        token=token,
        cancelada=False
    )

    try:
        db.session.add(reserva)
        db.session.commit()

        cancel_url = f"http://localhost:3000/cancelar/{token}"
        mensaje = (
            f"Hola {reserva.nombre},\n\n"
            f"Tu reserva para el servicio '{reserva.servicio}' fue confirmada para el {reserva.fecha.strftime('%d/%m/%Y')} a las {reserva.hora.strftime('%H:%M')}.\n"
            f"Si necesitás cancelar tu turno, podés hacerlo en este enlace:\n{cancel_url}\n\n"
            "¡Gracias por tu reserva!"
        )
        enviar_email_smtp(reserva.email, "Confirmación de reserva", mensaje)

        return jsonify({'message': 'Reserva creada correctamente', 'token': token, 'id': reserva.id}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error guardando reserva: {e}", exc_info=True)
        return jsonify({'error': 'Error al guardar la reserva', 'detail': str(e)}), 500

@api.route('/reserva-por-token/<string:token>', methods=['GET'])
def obtener_reserva_por_token(token):
    reserva = Reserva.query.filter_by(token=token, cancelada=False).first()
    if not reserva:
        return jsonify({'error': 'Token inválido o reserva no encontrada o cancelada'}), 404

    return jsonify({
        'reserva': {
            'nombre': reserva.nombre,
            'fecha': reserva.fecha.isoformat(),
            'hora': reserva.hora.strftime('%H:%M'),
            'servicio': reserva.servicio,
            'email': reserva.email
        }
    }), 200

@api.route('/cancelar/<string:token>', methods=['GET'])
def cancelar_reserva_por_token(token):
    reserva = Reserva.query.filter_by(token=token, cancelada=False).first()
    if not reserva:
        return jsonify({'error': 'Reserva no encontrada o ya cancelada'}), 404

    try:
        reserva.cancelada = True
        db.session.commit()

        mensaje = (
            f"Hola {reserva.nombre},\n\n"
            f"Tu reserva para el servicio '{reserva.servicio}' programada para el {reserva.fecha.strftime('%d/%m/%Y')} a las {reserva.hora.strftime('%H:%M')} ha sido cancelada correctamente.\n\n"
            "Esperamos poder atenderte en otra ocasión.\n\nSaludos cordiales."
        )
        enviar_email_smtp(reserva.email, "Confirmación de cancelación de reserva", mensaje)

        return jsonify({'message': 'Reserva cancelada correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cancelando reserva: {e}", exc_info=True)
        return jsonify({'error': 'Error al cancelar la reserva', 'detail': str(e)}), 500

@api.route('/reservas', methods=['GET'])
def obtener_reservas():
    fecha_str = request.args.get('fecha')
    email = request.args.get('email')

    if not fecha_str:
        return jsonify({'error': 'Debe proporcionar una fecha'}), 400

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido'}), 400

    query = Reserva.query.filter_by(fecha=fecha, cancelada=False)
    if email:
        query = query.filter_by(email=email)

    reservas = query.all()
    resultado = [dict(
        id=r.id,
        nombre=r.nombre,
        telefono=r.telefono,
        email=r.email,
        fecha=r.fecha.isoformat(),
        hora=r.hora.strftime('%H:%M'),
        servicio=r.servicio,
        token=r.token
    ) for r in reservas]

    return jsonify({'reservas': resultado}), 200

@api.route('/reservas', methods=['DELETE'])
def eliminar_reserva_publico():
    return jsonify({'error': 'Acceso no autorizado. Usar /admin/reservas para eliminar.'}), 403

@api.route('/enviar-email', methods=['POST'])
def enviar_email():
    data = request.get_json()
    email_destino = data.get('email')
    asunto = data.get('asunto')
    mensaje = data.get('mensaje')

    if not email_destino or not asunto or not mensaje:
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    success, info = enviar_email_smtp(email_destino, asunto, mensaje)
    if success:
        return jsonify({'message': 'Correo enviado exitosamente'}), 200
    else:
        return jsonify({'error': f'Error enviando correo: {info}'}), 500

# --- RUTAS DE ADMIN ---
@api.route('/admin/login', methods=['POST'])
def login_admin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    admin_email = os.getenv("ADMIN_EMAIL", "fiorellaviscardi.2412@gmail.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "123456789")

    if email == admin_email and password == admin_password:
        token = generar_jwt({'email': email, 'role': 'admin'})
        return jsonify({'message': 'Inicio de sesión exitoso', 'token': token}), 200
    else:
        return jsonify({'error': 'Credenciales inválidas'}), 401

@api.route('/admin/reservas', methods=['GET'])
@admin_required
def obtener_reservas_admin():
    fecha_str = request.args.get('fecha')
    if not fecha_str:
        return jsonify({'error': 'Debe proporcionar una fecha'}), 400

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido'}), 400

    reservas = Reserva.query.filter_by(fecha=fecha, cancelada=False).all()
    resultado = [dict(
        id=r.id,
        nombre=r.nombre,
        telefono=r.telefono,
        email=r.email,
        fecha=r.fecha.isoformat(),
        hora=r.hora.strftime('%H:%M'),
        servicio=r.servicio,
        token=r.token,
        cancelada=r.cancelada,
        creado_en=(r.creado_en.isoformat() if hasattr(r, 'creado_en') and r.creado_en else None)
    ) for r in reservas]

    return jsonify({'reservas': resultado}), 200

@api.route('/admin/reservas/<int:reserva_id>', methods=['DELETE'])
@admin_required
def eliminar_reserva_admin(reserva_id):
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return jsonify({'error': 'Reserva no encontrada'}), 404

    try:
        db.session.delete(reserva)
        db.session.commit()
        return jsonify({'message': 'Reserva eliminada con éxito'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error eliminando reserva admin: {e}", exc_info=True)
        return jsonify({'error': 'Error eliminando la reserva', 'detail': str(e)}), 500



@api.route("/admin/bloqueos", methods=["GET", "POST", "OPTIONS"])
def bloqueos():
    if request.method == "OPTIONS":
        return ""
    if request.method == "GET":
        fecha = request.args.get("fecha")
        
        return jsonify({"bloqueos": []})
    if request.method == "POST":
        data = request.json
        # crear bloqueo
        return jsonify({"message": "Bloqueo creado"}), 201





