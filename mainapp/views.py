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

# Vista para la página principal
def home(request):
    if request.method == 'POST':
        # Leer los datos del archivo JSON y devolver como respuesta HTTP
        with open(path_catalogo, 'r') as archivo:
            json_data = archivo.read()
        return HttpResponse(json_data,status=200)
    
    # Si la solicitud no es de tipo POST, renderizar la página home.html con los datos del archivo JSON
    with open(path_catalogo, 'r') as archivo:
        json_data = archivo.read()
    return render(request,"home.html",{'json_data': json_data})

# Función para guardar una imagen codificada en base64 en el sistema de archivos
def save_image_base64(file,ruta):
    with open(ruta, 'wb') as f:
        f.write(file)

# Función para agregar datos al archivo JSON
def add_data(request):
    if request.method == 'POST':
        try:
            # Obtener los datos JSON de la solicitud
            datos = json.loads(request.body)
            objeto = datos.get('objeto')
            tipo = datos.get('tblName')

             # Si el tipo de datos es "pastillas"
            if tipo=="pastillas":
                # Si se proporciona una imagen
                if objeto['fotoReferencial']:
                    # Generar un nombre único para la imagen y guardarla en el sistema de archivos
                    fileName=str(uuid.uuid4()) + '.png'
                    ruta = get_url_image(fileName)
                    file_no_metadatos = objeto['fotoReferencial'].split(",")[-1]
                    file_decoded = base64.b64decode(file_no_metadatos)
                    save_image_base64(file_decoded,ruta)
                    objeto['fotoReferencial'] = path_image_relative+fileName
                else:
                    # Si no se proporciona una imagen, establecer una imagen predeterminada
                    objeto['fotoReferencial'] = path_image_relative+"no-image.png"

            # Abrir el archivo JSON, agregar el objeto y guardar los cambios
            with open(path_catalogo, 'r+') as file:
                data = json.load(file)
                data[tipo].append(objeto)
                file.seek(0)
                json.dump(data, file, indent=4)
        
            return HttpResponse('¡Registro agregado!',status=200)
        except Exception as e:
             return HttpResponse('¡Error al agregar el registro!',status=400)
    
# Función para eliminar datos del archivo JSON
def delete_data(request):
    if request.method == 'PUT':
        try:
             # Obtener los datos JSON de la solicitud
            data = json.loads(request.body)  
            # Si se eliminan datos de "pastillas", eliminar también la imagen asociada si no es la predeterminada
            if data.get('tblName')=="pastillas":
                prevNameImage=data.get('prevurl')[9:]
                if prevNameImage!="no-image.png":
                    eliminar_imagen(prevNameImage)
            # Abrir el archivo JSON, eliminar los datos, actualizar los índices y guardar los cambios
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

# Función para actualizar datos en el archivo JSON
def update_data(request):
    if request.method == 'PUT':
        try:
            # Obtener los datos JSON de la solicitud
            data = json.loads(request.body)  
            # Abrir el archivo JSON, actualizar los datos, y guardar los cambios
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
        
#Funcion para actualizar la imagen de las pastillas
def update_image(request):
    if request.method == 'POST':
        try:
             # Obtener el archivo de la solicitud
            archivo = request.FILES['archivo']
            # Verificar si se proporcionó un archivo
            if not archivo:
                return HttpResponse('¡No se ha proporcionado ningún archivo!', status=400)
            
            # Obtener el ID y la URL de imagen previa de la solicitud
            id=request.POST.get('id')
             # Extraer el nombre de la imagen previa de la URL
            prevUrlImage = request.POST.get('prevurl')
            # Se asume que 'prevurl' contiene la URL completa y el nombre de la imagen empieza en el índice 9
            prevNameImage=prevUrlImage[9:]
             # Eliminar la imagen previa si no es la imagen predeterminada
            if prevNameImage!="no-image.png":
                eliminar_imagen(prevNameImage)
            # Generar un nombre único para el archivo y actualizar la URL de la imagen en los datos
            nombre_archivo = str(uuid.uuid4()) + os.path.splitext(archivo.name)[1]
            update_url_image(id,nombre_archivo)
            
            # Obtener la ruta del archivo en el sistema de archivos
            ruta_archivo = get_url_image(nombre_archivo)
            # Escribir el archivo en el sistema de archivos
            with open(ruta_archivo, 'wb') as f:
                for chunk in archivo.chunks():
                    f.write(chunk)
            return HttpResponse('Foto actualizada', status=200)
        except Exception as e:
            return HttpResponse('¡Error al actualizar la foto!',status=400)

# Función para eliminar una imagen del sistema de archivos
def eliminar_imagen(prevNameImage):
    # Obtener la ruta de la imagen
    prevUrlImage=get_url_image(prevNameImage)
    # Verificar si la imagen existe y eliminarla si es así
    if os.path.exists(prevUrlImage):
        os.remove(prevUrlImage)

# Función para obtener la URL completa de una imagen en el sistema de archivos
def get_url_image(name):
    # Combinar el nombre del archivo con la ruta del directorio de medios
    path=os.path.join(settings.MEDIA_ROOT,name) 
    return path

# Función para actualizar la URL de la imagen en los datos
def update_url_image(id,currNameImage):
    # Abrir y actualizar los datos en el archivo JSON
    with open(path_catalogo, 'r+') as file:
        # Cargar los datos JSON existentes
        json_data = json.load(file)
        # Calcular el índice de la fila basado en el ID proporcionado
        row_index = int(id)-1
        # Nombre del campo que contiene la URL de la imagen
        field_name ="fotoReferencial"
        # Nuevo valor de la URL de la imagen
        new_value = path_image_relative+currNameImage
        # Actualizar el valor del campo de imagen en los datos JSON
        if field_name in json_data['pastillas'][row_index]:
            json_data['pastillas'][row_index][field_name] = new_value    
            file.seek(0)
            json.dump(json_data, file, indent=4)
            file.truncate()