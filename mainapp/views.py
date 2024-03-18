from django.shortcuts import render
import json
import os
from django.conf import settings
from django.http import HttpResponse
import pdb
import uuid
import base64

path_image_relative="./images/"
path_catalogo="catalogo.json"

def notfound(request):
    return render(request,"notfound.html")

def home(request):
    if request.method == 'POST':
        with open(path_catalogo, 'r') as archivo:
            json_data = archivo.read()
        return HttpResponse(json_data,status=200)
    
    with open(path_catalogo, 'r') as archivo:
        json_data = archivo.read()
    return render(request,"home.html",{'json_data': json_data})

def save_image_base64(file,ruta):
    with open(ruta, 'wb') as f:
        f.write(file)

def add_data(request):
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)
            objeto = datos.get('objeto')
            tipo = datos.get('tblName')

            if tipo=="pastillas":
                if objeto['fotoReferencial']:
                    fileName=str(uuid.uuid4()) + '.png'
                    ruta = get_url_image(fileName)
                    file_no_metadatos = objeto['fotoReferencial'].split(",")[-1]
                    file_decoded = base64.b64decode(file_no_metadatos)
                    save_image_base64(file_decoded,ruta)
                    objeto['fotoReferencial'] = path_image_relative+fileName
                else:
                    objeto['fotoReferencial'] = path_image_relative+"no-image.png"

            with open(path_catalogo, 'r+') as file:
                data = json.load(file)
                data[tipo].append(objeto)
                file.seek(0)
                json.dump(data, file, indent=4)
        
            return HttpResponse('¡Registro agregado!',status=200)
        except Exception as e:
             return HttpResponse('¡Error al agregar el registro!',status=400)
    
def delete_data(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)  

            if data.get('tblName')=="pastillas":
                prevNameImage=data.get('prevurl')[9:]
                if prevNameImage!="no-image.png":
                    eliminar_imagen(prevNameImage)

            with open(path_catalogo, 'r+') as file:
                json_data = json.load(file)
                row_index = int(data.get('rowIndex'))-1
                del json_data[data.get('tblName')][row_index]

                for index, row in enumerate(json_data[data.get('tblName')]):
                    row['id'] = index + 1

                file.seek(0)
                json.dump(json_data, file, indent=4)
                file.truncate()
            
            return HttpResponse('¡Registro eliminado!',status=200)
        except Exception as e:
            return HttpResponse('¡Error al eliminar el registro!',status=400)
    
def update_data(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)  
            with open(path_catalogo, 'r+') as file:
                json_data = json.load(file)
                row_index = int(data.get('rowIndex'))-1
                field_name = data.get('fieldName')
                new_value = data.get('newValue')
                
                if field_name in json_data[data.get('tblName')][row_index]:
                    json_data[data.get('tblName')][row_index][field_name] = new_value
                
                file.seek(0)
                json.dump(json_data, file, indent=4)
                file.truncate()
            return HttpResponse('¡Registro actualizado!',status=200)
        except Exception as e:
            return HttpResponse('¡Error al actualizar el registro!',status=400)
        

def update_image(request):
    if request.method == 'POST':
        try:
            archivo = request.FILES['archivo']
            if not archivo:
                return HttpResponse('¡No se ha proporcionado ningún archivo!', status=400)
            
            id=request.POST.get('id')
            prevUrlImage = request.POST.get('prevurl')
            prevNameImage=prevUrlImage[9:]
            if prevNameImage!="no-image.png":
                eliminar_imagen(prevNameImage)
            nombre_archivo = str(uuid.uuid4()) + os.path.splitext(archivo.name)[1]
            update_url_image(id,nombre_archivo)

            ruta_archivo = get_url_image(nombre_archivo)
            with open(ruta_archivo, 'wb') as f:
                for chunk in archivo.chunks():
                    f.write(chunk)
            return HttpResponse('Foto actualizada', status=200)
        except Exception as e:
            return HttpResponse('¡Error al actualizar la foto!',status=400)

def eliminar_imagen(prevNameImage):
    prevUrlImage=get_url_image(prevNameImage)
    if os.path.exists(prevUrlImage):
        os.remove(prevUrlImage)

def get_url_image(name):
    path=os.path.join(settings.MEDIA_ROOT,name) 
    return path

def update_url_image(id,currNameImage):
    with open(path_catalogo, 'r+') as file:
        json_data = json.load(file)
        row_index = int(id)-1
        field_name ="fotoReferencial"
        new_value = path_image_relative+currNameImage
                
        if field_name in json_data['pastillas'][row_index]:
            json_data['pastillas'][row_index][field_name] = new_value    
            file.seek(0)
            json.dump(json_data, file, indent=4)
            file.truncate()