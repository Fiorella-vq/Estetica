from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime, time

from sqlalchemy import Index

db = SQLAlchemy()

class Reserva(db.Model):
    __tablename__ = 'reserva'
    __table_args__ = (
        Index(
            'unique_fecha_hora_active_reservas', 
            'fecha', 'hora', 
            unique=True,
            postgresql_where=db.Column('cancelada') == False
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    servicio = db.Column(db.String(100), nullable=True)
    token = db.Column(db.String(50), unique=True, nullable=False)
    cancelada = db.Column(db.Boolean, default=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    precio = db.Column(db.Float, nullable=False, default=0.0)  # <-- agregado

    def __init__(self, nombre, telefono, email, fecha, hora, servicio, precio, token=None, cancelada=False):
        self.nombre = nombre
        self.telefono = telefono
        self.email = email
        self.fecha = fecha
        self.hora = hora
        self.servicio = servicio
        self.precio = precio
        self.token = token or str(uuid.uuid4())
        self.cancelada = cancelada

    def __repr__(self):
        return f'<Reserva {self.fecha} {self.hora} - {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "fecha": self.fecha.isoformat(),
            "hora": self.hora.strftime('%H:%M'),
            "servicio": self.servicio,
            "precio": self.precio,  # <-- agregado aquí también
            "token": self.token,
            "cancelada": self.cancelada,
            "creado_en": self.creado_en.isoformat()
        }

        
class Bloqueo(db.Model):
    __tablename__ = 'bloqueo'
    __table_args__ = (
        Index('unique_fecha_hora_bloqueo', 'fecha', 'hora', unique=True),
    )

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    bloqueado = db.Column(db.Boolean, nullable=False, default=True)

    nombre = db.Column(db.String(100))   # <--- agregar campo nombre
    servicio = db.Column(db.String(100)) # <--- agregar campo servicio

    def __init__(self, fecha, hora, bloqueado=True, nombre=None, servicio=None):
        self.fecha = fecha
        self.hora = hora
        self.bloqueado = bloqueado
        self.nombre = nombre
        self.servicio = servicio

    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha.isoformat(),
            "hora": self.hora.strftime('%H:%M'),
            "bloqueado": self.bloqueado,
            "nombre": self.nombre or '',
            "servicio": self.servicio or ''
        }

