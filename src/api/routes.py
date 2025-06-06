from flask import Blueprint, request, jsonify, current_app
from api.models import db, Reserva, Bloqueo
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
import mercadopago

# --- CONFIGURACIÓN MERCADOPAGO ---




token = os.getenv("MP_ACCESS_TOKEN")
print(f"Token cargado desde entorno: {token}")

sdk = mercadopago.SDK(token)



# --- BLUEPRINTS ---

api = Blueprint('api', __name__)
CORS(api, origins=["http://localhost:3000"], supports_credentials=True)

# --- CONFIGURACIÓN JWT ---
SECRET_KEY = os.getenv('SECRET_KEY', 'mi_clave_secreta_super_segura')

def generar_jwt(payload, expiracion_minutos=60):
    payload = payload.copy()
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
        if request.method == 'OPTIONS':
            return '', 204
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token faltante o mal formado'}), 401
        token = auth_header[7:]
        decoded = verificar_jwt(token)
        if not decoded or decoded.get('role') != 'admin':
            return jsonify({'error': 'Token inválido o no autorizado'}), 401
        return f(*args, **kwargs)
    return wrapper

# --- UTILITARIOS ---

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

    if fecha < datetime.utcnow().date():
        return jsonify({'error': 'No se pueden hacer reservas en el pasado'}), 400

    # Verificar reserva existente no cancelada
    reserva_existente = Reserva.query.filter_by(fecha=fecha, hora=hora, cancelada=False).first()
    if reserva_existente:
        return jsonify({'error': 'Ya existe una reserva en esa fecha y hora'}), 409

    # Verificar bloqueo
    bloqueo_existente = Bloqueo.query.filter_by(fecha=fecha, hora=hora).first()
    if bloqueo_existente:
        return jsonify({'error': 'El horario está bloqueado y no se puede reservar'}), 409

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

@api.route('/cancelar/<string:token>', methods=['PUT'])
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
    resultado = [r.serialize() for r in reservas]

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

@api.route('/reserva/ultima', methods=['GET'])
def obtener_ultima_reserva():
    ultima_reserva = Reserva.query.filter_by(cancelada=False).order_by(Reserva.id.desc()).first()
    if not ultima_reserva:
        return jsonify({'error': 'No hay reservas disponibles'}), 404

    return jsonify({
        'id': ultima_reserva.id,
        'nombre': ultima_reserva.nombre,
        'fecha': ultima_reserva.fecha.isoformat(),
        'hora': ultima_reserva.hora.strftime('%H:%M'),
        'servicio': ultima_reserva.servicio,
        'email': ultima_reserva.email,
    }), 200

# --- RUTAS ADMIN ---

@api.route('/admin/login', methods=['POST'])
def login_admin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if email != os.getenv('ADMIN_EMAIL') or password != os.getenv('ADMIN_PASSWORD'):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    token = generar_jwt({'email': email, 'role': 'admin'}, expiracion_minutos=60*24)
    return jsonify({'token': token}), 200

@api.route('/admin/reservas', methods=['GET'])
@admin_required
def admin_obtener_reservas():
    reservas = Reserva.query.filter_by(cancelada=False).all()
    resultado = [r.serialize() for r in reservas]
    return jsonify({'reservas': resultado}), 200

@api.route('/admin/reservas/<int:reserva_id>', methods=['DELETE'])
@admin_required
def admin_eliminar_reserva(reserva_id):
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return jsonify({'error': 'Reserva no encontrada'}), 404

    try:
        db.session.delete(reserva)
        db.session.commit()
        return jsonify({'message': 'Reserva eliminada correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error eliminando reserva', 'detail': str(e)}), 500

@api.route('/admin/bloqueos', methods=['GET'])
@admin_required
def admin_obtener_bloqueos():
    bloqueos = Bloqueo.query.all()
    resultado = [b.serialize() for b in bloqueos]
    return jsonify({'bloqueos': resultado}), 200

@api.route('/admin/bloqueos', methods=['POST'])
@admin_required
def admin_crear_bloqueo():
    data = request.get_json()
    fecha_str = data.get('fecha')
    hora_str = data.get('hora')

    if not fecha_str or not hora_str:
        return jsonify({'error': 'Faltan fecha u hora'}), 400

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        hora = datetime.strptime(hora_str, '%H:%M').time()
    except ValueError:
        return jsonify({'error': 'Formato de fecha u hora inválido'}), 400

    bloqueo_existente = Bloqueo.query.filter_by(fecha=fecha, hora=hora).first()
    if bloqueo_existente:
        return jsonify({'error': 'Bloqueo ya existe para esa fecha y hora'}), 409

    bloqueo = Bloqueo(fecha=fecha, hora=hora)
    try:
        db.session.add(bloqueo)
        db.session.commit()
        return jsonify({'message': 'Bloqueo creado'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error creando bloqueo', 'detail': str(e)}), 500

@api.route('/admin/bloqueos/<int:bloqueo_id>', methods=['DELETE'])
@admin_required
def admin_eliminar_bloqueo(bloqueo_id):
    bloqueo = Bloqueo.query.get(bloqueo_id)
    if not bloqueo:
        return jsonify({'error': 'Bloqueo no encontrado'}), 404

    try:
        db.session.delete(bloqueo)
        db.session.commit()
        return jsonify({'message': 'Bloqueo eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error eliminando bloqueo', 'detail': str(e)}), 500
    
    
# --- RUTAS DE PAGO ---

@api.route("/pagos", methods=["POST"])
def crear_pago():
    data = request.get_json()
    monto = data.get("monto")
    email = data.get("email")

    if not monto:
        return jsonify({"error": "Falta el monto"}), 400

    if not email:
        return jsonify({"error": "Falta el email para el pago"}), 400

    try:
        preference_data = {
            "items": [
                {
                    "title": "Pago de servicio",
                    "quantity": 1,
                    "unit_price": float(monto),
                    "currency_id": "ARS"
                }
            ],
            "payer": {
                "email": email
            },
            "back_urls": {
                "success": "http://localhost:3000/pago-exitoso",
                "failure": "http://localhost:3000/pago-fallido",
                "pending": "http://localhost:3000/pago-pendiente"
            },
            "auto_return": "approved"
        }

        preference_response = sdk.preference().create(preference_data)

        return jsonify({
            "preference_id": preference_response["response"],
            "init_point": preference_response["response"]
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error creando preferencia de pago: {e}", exc_info=True)
        return jsonify({"error": "Error creando la preferencia de pago", "detail": str(e)}), 500
