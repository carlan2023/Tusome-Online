import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

from .models import User


@csrf_exempt
@require_http_methods(["POST"])
def register_user(request):
    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'Invalid JSON payload.'}, status=400)

    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    role = (data.get('role') or 'learner').strip().lower()

    if not username or not email or not password:
        return JsonResponse({'ok': False, 'error': 'username, email and password are required.'}, status=400)

    if role not in {'learner', 'consultant', 'admin'}:
        return JsonResponse({'ok': False, 'error': 'Role must be learner, consultant or admin.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'ok': False, 'error': 'Username already exists.'}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({'ok': False, 'error': 'Email already exists.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.role = role
    user.first_name = (data.get('first_name') or '').strip()
    user.last_name = (data.get('last_name') or '').strip()
    user.phone = (data.get('phone') or '').strip()
    user.bio = (data.get('bio') or '').strip()

    if role == 'admin':
        user.is_staff = True
        user.is_superuser = True

    user.save()
    login(request, user)

    return JsonResponse({
        'ok': True,
        'message': 'User registered successfully.',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        },
    }, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):
    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'Invalid JSON payload.'}, status=400)

    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not password or not (username or email):
        return JsonResponse({'ok': False, 'error': 'username/email and password are required.'}, status=400)

    user = None
    if email:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = None
    if user is None and username:
        user = authenticate(request, username=username, password=password)
    else:
        user = authenticate(request, username=user.username if user else username, password=password)

    if user is None:
        return JsonResponse({'ok': False, 'error': 'Invalid credentials.'}, status=401)

    login(request, user)

    return JsonResponse({
        'ok': True,
        'message': 'Logged in successfully.',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        },
    })


@require_http_methods(["GET"])
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'ok': False, 'error': 'Not authenticated.'}, status=401)

    return JsonResponse({
        'ok': True,
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'role': request.user.role,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser,
        },
    })


@csrf_exempt
@require_http_methods(["POST"])
def logout_user(request):
    logout(request)
    return JsonResponse({'ok': True, 'message': 'Logged out successfully.'})
