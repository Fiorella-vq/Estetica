from flask import Blueprint, request, jsonify, current_app
from src.api.models import db, Reserva, Bloqueo, Testimonio
from flask_cors import CORS
from datetime import datetime, timedelta, time
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
if not token:
    print("⚠️  MP_ACCESS_TOKEN no configurado en el entorno")  # ✅ se evita current_app aquí
sdk = mercadopago.SDK(token) if token else None

# --- BLUEPRINT ---
api = Blueprint('api', __name__)
CORS(api, origins=["https://floresteticaintegral.onrender.com"], supports_credentials=True)

# --- JWT ---
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

@api.route('/precio-servicio', methods=['POST'])
def precio_servicio():
    data = request.get_json()
    servicio = data.get('servicio', '').lower()

    precios = {
        "depilación láser": 3500,
        "pestañas": 4800,
        "masajes descontracturantes": 4000,
    }

    precio = precios.get(servicio)
    if precio is None:
        return jsonify({'error': 'Servicio no encontrado'}), 404

    return jsonify({'precio': precio}), 200

# --- RUTAS DE RESERVAS ---

@api.route('/reservas', methods=['POST'])
def crear_reserva():
    data = request.get_json()
    required_fields = ['nombre', 'email', 'telefono', 'fecha', 'hora', 'servicio', 'precio']

    if not data or not all(data.get(field) for field in required_fields):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    try:
        fecha = datetime.strptime(data['fecha'], '%Y-%m-%d').date()
        hora = datetime.strptime(data['hora'], '%H:%M').time()
        precio = float(data['precio'])
    except ValueError:
        return jsonify({'error': 'Formato de fecha, hora o precio inválido'}), 400

    if fecha < datetime.utcnow().date():
        return jsonify({'error': 'No se pueden hacer reservas en el pasado'}), 400

    if Reserva.query.filter_by(fecha=fecha, hora=hora, cancelada=False).first():
        return jsonify({'error': 'Ya existe una reserva en esa fecha y hora'}), 409

    if Bloqueo.query.filter_by(fecha=fecha, hora=hora, bloqueado=True).first():
        return jsonify({'error': 'El horario está bloqueado y no se puede reservar'}), 409

    token = generate_token()

    reserva = Reserva(
        nombre=data['nombre'],
        email=data['email'],
        telefono=data['telefono'],
        fecha=fecha,
        hora=hora,
        servicio=data['servicio'],
        precio=precio,
        token=token,
        cancelada=False,
        direccion=data.get('direccion'),
        variante_precio=data.get('variante_precio')
    )

    try:
        db.session.add(reserva)
        db.session.commit()

        cancel_url = f"https://floresteticaintegral.onrender.com/cancelar/{token}"
        mensaje = (
            f"Hola {reserva.nombre},\n\n"
            f"Tu reserva para el servicio '{reserva.servicio}' fue confirmada para el {reserva.fecha.strftime('%d/%m/%Y')} a las {reserva.hora.strftime('%H:%M')}.\n"
            f"Dirección: {reserva.direccion or 'No especificada'}\n"
            f"Variante: {reserva.variante_precio or 'No especificada'}\n"
            f"Si necesitás cancelar tu turno, podés hacerlo en este enlace:\n{cancel_url}\n\n"
            "¡Gracias por tu reserva!"
        )
        enviar_email_smtp(reserva.email, "Confirmación de reserva", mensaje)

        return jsonify({'message': 'Reserva creada correctamente', 'token': token, 'id': reserva.id}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error guardando reserva: {e}", exc_info=True)
        return jsonify({'error': 'Error al guardar la reserva', 'detail': str(e)}), 500


@api.route('/reserva/<int:reserva_id>', methods=['GET'])
def obtener_reserva_por_id(reserva_id):
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return jsonify({'error': 'Reserva no encontrada'}), 404

    return jsonify({
        "id": reserva.id,
        "nombre": reserva.nombre,
        "email": reserva.email,
        "telefono": reserva.telefono,
        "fecha": reserva.fecha.isoformat() if hasattr(reserva.fecha, 'isoformat') else str(reserva.fecha),
        "hora": reserva.hora.strftime('%H:%M'),
        "servicio": reserva.servicio,
        "precio": reserva.precio,
        "cancelada": reserva.cancelada,
        "direccion": reserva.direccion,
        "variante_precio": reserva.variante_precio,
    }), 200


@api.route('/reserva-por-token/<string:token>', methods=['GET'])
def obtener_reserva_por_token(token):
    reserva = Reserva.query.filter_by(token=token, cancelada=False).first()
    if not reserva:
        return jsonify({'error': 'Token inválido o reserva no encontrada o cancelada'}), 404

    return jsonify({
        'reserva': {
            'nombre': reserva.nombre,
            'telefono': reserva.telefono,
            'fecha': reserva.fecha.isoformat(),
            'hora': reserva.hora.strftime('%H:%M'),
            'servicio': reserva.servicio,
            'email': reserva.email,
            'direccion': reserva.direccion,
            'variante_precio': reserva.variante_precio,
            'precio': reserva.precio
        }
    }), 200


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

    resultado = []
    for r in reservas:
        try:
            resultado.append({
                "id": r.id,
                "nombre": r.nombre,
                "email": r.email,
                "telefono": r.telefono,
                "fecha": r.fecha.isoformat(),
                "hora": r.hora.strftime("%H:%M"),
                "servicio": r.servicio,
                "precio": r.precio,
                "cancelada": r.cancelada,
                "direccion": r.direccion,
                "variante_precio": r.variante_precio,
            })
        except Exception as e:
            current_app.logger.error(f"Error serializando reserva {r.id}: {e}")

    return jsonify({'reservas': resultado}), 200


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


@api.route('/reserva/<int:reserva_id>', methods=['PUT'])
def cancelar_reserva_por_id(reserva_id):
    reserva = Reserva.query.get(reserva_id)
    if not reserva or reserva.cancelada:
        return jsonify({'error': 'Reserva no encontrada o ya cancelada'}), 404

    try:
        reserva.cancelada = True
        db.session.commit()

        mensaje_cliente = (
            f"Hola {reserva.nombre},\n\n"
            f"Tu reserva para el servicio '{reserva.servicio}' programada para el {reserva.fecha.strftime('%d/%m/%Y')} a las {reserva.hora.strftime('%H:%M')} ha sido cancelada correctamente.\n\n"
            "Esperamos poder atenderte en otra ocasión.\n\nSaludos cordiales."
        )
        enviar_email_smtp(reserva.email, "Cancelación de reserva", mensaje_cliente)

        admin_email = os.getenv("ADMIN_EMAIL", "admin@tuservicio.com")
        mensaje_admin = (
            f"Reserva cancelada por el cliente:\n\n"
            f"Nombre: {reserva.nombre}\n"
            f"Email: {reserva.email}\n"
            f"Servicio: {reserva.servicio}\n"
            f"Fecha: {reserva.fecha.strftime('%d/%m/%Y')}\n"
            f"Hora: {reserva.hora.strftime('%H:%M')}\n"
        )
        enviar_email_smtp(admin_email, "Reserva cancelada por cliente", mensaje_admin)

        return jsonify({'message': 'Reserva cancelada correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cancelando reserva: {e}", exc_info=True)
        return jsonify({'error': 'Error al cancelar la reserva', 'detail': str(e)}), 500


@api.route('/reservas', methods=['DELETE'])
def eliminar_reserva_publico():
    return jsonify({'error': 'Acceso no autorizado. Usar /admin/reservas para eliminar.'}), 403


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
    fecha_str = request.args.get('fecha')
    if not fecha_str:
        return jsonify({'error': 'Debe proporcionar una fecha en formato YYYY-MM-DD'}), 400
    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido'}), 400

    reservas = Reserva.query.filter_by(fecha=fecha, cancelada=False).all()
    resultado = []
    for r in reservas:
        try:
            resultado.append({
                "id": r.id,
                "nombre": r.nombre,
                "email": r.email,
                "telefono": r.telefono,
                "fecha": r.fecha.isoformat(),
                "hora": r.hora.strftime("%H:%M"),
                "servicio": r.servicio,
                "precio": r.precio,
                "cancelada": r.cancelada,
                "direccion": r.direccion,
                "variante_precio": r.variante_precio,
            })
        except Exception as e:
            current_app.logger.error(f"Error serializando reserva {r.id}: {e}")
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


# --- HORARIOS DISPONIBLES PÚBLICO ---

@api.route('/horarios-disponibles', methods=['GET'])
def horarios_disponibles():
    fecha_str = request.args.get('fecha')
    if not fecha_str:
        return jsonify({"error": "Falta la fecha"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido"}), 400

    HORARIOS = [
        time(8,0), time(9,0), time(10,0), time(11,0), time(12,0),
        time(13,0), time(14,0), time(15,0), time(16,0), time(17,0), time(18,0)
    ]

    bloqueos = Bloqueo.query.filter_by(fecha=fecha, bloqueado=True).all()
    horarios_bloqueados = {b.hora for b in bloqueos}

    reservas = Reserva.query.filter_by(fecha=fecha, cancelada=False).all()
    horarios_reservados = {r.hora for r in reservas}

    horarios_disponibles = [
        h.strftime("%H:%M") for h in HORARIOS
        if h not in horarios_bloqueados and h not in horarios_reservados
    ]

    return jsonify({
        "fecha": fecha_str,
        "horarios_disponibles": horarios_disponibles
    }), 200


# --- RUTAS BLOQUEOS ADMIN ---

@api.route("/admin/bloqueos", methods=["GET"])
@admin_required
def get_bloqueos():
    fecha_str = request.args.get("fecha")
    if not fecha_str:
        return jsonify({"error": "Falta la fecha"}), 400

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido"}), 400

    bloqueos = Bloqueo.query.filter_by(fecha=fecha).all()
    return jsonify({"bloqueos": [b.serialize() for b in bloqueos]}), 200

@api.route("/admin/bloqueos", methods=["POST"])
@admin_required
def crear_bloqueo():
    data = request.get_json()

    try:
        fecha = datetime.strptime(data.get("fecha"), "%Y-%m-%d").date()
        hora = datetime.strptime(data.get("hora"), "%H:%M").time()
        bloqueado = data.get("bloqueado", True)
        nombre = data.get("nombre")
        servicio = data.get("servicio")

        if not nombre or not servicio:
            return jsonify({"error": "Faltan nombre o servicio"}), 400

        if Bloqueo.query.filter_by(fecha=fecha, hora=hora).first():
            return jsonify({"error": "Ya existe un bloqueo en ese horario"}), 400

        nuevo_bloqueo = Bloqueo(
            fecha=fecha,
            hora=hora,
            bloqueado=bloqueado,
            nombre=nombre,
            servicio=servicio
        )
        db.session.add(nuevo_bloqueo)
        db.session.commit()
        return jsonify({"message": "Bloqueo creado correctamente"}), 201
    except Exception as e:
        current_app.logger.error(f"Error creando bloqueo: {e}", exc_info=True)
        return jsonify({"error": "Error creando bloqueo", "detail": str(e)}), 500


@api.route("/admin/bloqueos/<int:id>", methods=["PUT"])
@admin_required
def actualizar_bloqueo(id):
    bloqueo = Bloqueo.query.get(id)
    if not bloqueo:
        return jsonify({"error": "Bloqueo no encontrado"}), 404

    data = request.get_json()
    try:
        if "bloqueado" in data:
            bloqueo.bloqueado = data["bloqueado"]
        if "nombre" in data:
            bloqueo.nombre = data["nombre"]
        if "servicio" in data:
            bloqueo.servicio = data["servicio"]

        db.session.commit()
        return jsonify({"message": "Bloqueo actualizado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error actualizando bloqueo: {e}", exc_info=True)
        return jsonify({"error": "Error actualizando bloqueo", "detail": str(e)}), 500

@api.route("/admin/bloqueos/<int:id>", methods=["DELETE"])
@admin_required
def eliminar_bloqueo(id):
    bloqueo = Bloqueo.query.get(id)
    if not bloqueo:
        return jsonify({"error": "Bloqueo no encontrado"}), 404
    try:
        db.session.delete(bloqueo)
        db.session.commit()
        return jsonify({"message": "Bloqueo eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error eliminando bloqueo: {e}", exc_info=True)
        return jsonify({"error": "Error eliminando bloqueo", "detail": str(e)}), 500


# --- RUTAS TESTIMONIOS ---

@api.route('/testimonios', methods=['POST'])
def crear_testimonio():
    data = request.get_json()
    nombre = data.get('nombre')
    comentario = data.get('comentario')
    puntuacion = data.get('puntuacion') or data.get('estrellas')  

    if not nombre or not comentario or not puntuacion:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    try:
        puntuacion = int(puntuacion)
    except ValueError:
        return jsonify({'error': 'Puntuación debe ser un número entero'}), 400

    nuevo = Testimonio(nombre=nombre, comentario=comentario, puntuacion=puntuacion)
    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify({'message': 'Testimonio creado correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creando testimonio: {e}", exc_info=True)
        return jsonify({'error': 'Error guardando testimonio', 'detail': str(e)}), 500



# --- RUTAS MERCADOPAGO ---

@api.route("/api/crear-preferencia", methods=["POST"])
def crear_preferencia():
    datos = request.get_json()
    items = datos.get("items", [])
    if not items:
        return jsonify({"error": "No se recibieron items"}), 400

    preference_data = {
        "items": items,
        "back_urls": {
            "success": "https://floresteticaintegral.onrender.com/success",
            "failure": "https://floresteticaintegral.onrender.com/failure",
            "pending": "https://floresteticaintegral.onrender.com/pending"
        },
        "auto_return": "approved",
        "binary_mode": True,
    }

    try:
        preference_response = sdk.preference().create(preference_data)
        return jsonify(preference_response["response"]), 200
    except Exception as e:
        current_app.logger.error(f"Error creando preferencia MercadoPago: {e}")
        return jsonify({"error": "Error creando preferencia", "detail": str(e)}), 500
