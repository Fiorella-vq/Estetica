  
import os
from flask_admin import Admin
from .models import db, Reserva, Bloqueo
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    # Agregar el modelo Reserva al panel de administración
    admin.add_view(ModelView(Reserva, db.session))
    admin.add_view(ModelView(Bloqueo, db.session))

# Función para verificar login del administrador
def check_admin_login(email, password):
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    return email == admin_email and password == admin_password
    
  