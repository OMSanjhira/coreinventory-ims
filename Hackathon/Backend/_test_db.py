import sys, traceback
try:
    from database.connection import engine, Base
    print("Engine OK:", engine.url)
    from models import *
    print("Models OK")
    Base.metadata.create_all(bind=engine)
    print("Tables created!")
except Exception as e:
    print("ERROR:", type(e).__name__)
    traceback.print_exc()
