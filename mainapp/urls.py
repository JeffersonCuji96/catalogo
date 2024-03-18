from django.urls import path
from django.views.generic import RedirectView
from django.urls import path
from django.views.static import serve
from django.conf import settings

from . import views

urlpatterns = [
    path('', views.home),
    path('update_data/', views.update_data, name='update_data'),
    path('delete_data/', views.delete_data, name='delete_data'),
    path('add_data/',views.add_data, name='add_data'),
    path('update_image/',views.update_image,name='update_image'),
    path('images/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
    path('notfound/', views.notfound, name='notfound'),
    path('<path:anything>/', RedirectView.as_view(url='/notfound/')),
]