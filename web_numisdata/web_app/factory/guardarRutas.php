<?php
// Leer el contenido JSON enviado desde el frontend
$data = file_get_contents('php://input');

// Validar contenido
if($data){
    file_put_contents('rutas.geojson', $data);
    echo json_encode(['status' => 'ok']);
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No se recibió ningún dato']);
}
?>