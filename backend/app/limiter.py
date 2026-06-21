from slowapi import Limiter
from slowapi.util import get_remote_address

# Limiter partagé, importé à la fois par main.py (pour le brancher à l'app)
# et par app/api/routes.py (pour décorer les routes). Le mettre dans un
# fichier séparé évite l'import circulaire main.py <-> routes.py.
limiter = Limiter(key_func=get_remote_address)