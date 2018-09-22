from django.urls import path
from . import views
urlpatterns = [
    path('', views.loader, name='loader'),
    path('index/',views.post_list,name='main'),
    path('talks/', views.talks, name='talks'),
    path('about-me/', views.aboutme, name='aboutme'),
    #path('talks/', views.talks, name='talks'),
    #path('talks/', views.talks, name='talks'),
]