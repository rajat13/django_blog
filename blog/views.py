from django.shortcuts import render
from .models import Post
# Create your views here.
def post_list(request):
    posts=Post.objects.all()
    return render(request, 'blog/index.html', {'posts':posts})
def talks(request):
    return render(request,'blog/talks/index.html')
def aboutme(request):
    return render(request,'blog/aboutme/index.html')
def loader(request):
    return render(request,'blog/loader.html')