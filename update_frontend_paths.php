<?php
$dir = new RecursiveDirectoryIterator('src');
$ite = new RecursiveIteratorIterator($dir);
$files = new RegexIterator($ite, '/^.+\.tsx$/i', RecursiveRegexIterator::GET_MATCH);

foreach($files as $file) {
    $path = $file[0];
    $content = file_get_contents($path);
    $original = $content;
    
    // Replace photo URLs
    $content = preg_replace('/(\$\{API_BASE_URL\}\/candidates\/uploads\/)([^"}]+(jpg|jpeg|png))/', '${API_BASE_URL}/../uploads/candidates/photos/$2', $content);
    // Replace resume URLs (for .pdf, .doc, .docx) - but wait, the extension isn't always hardcoded in the string
    // e.g. `${API_BASE_URL}/candidates/uploads/${candidate.photo}`
    // If it's a variable like `${c.photo}`, we don't know the extension.
    
    // So we'll specifically target known variables:
    // candidate.photo, c.photo, form.photo, item.image -> /photos/
    $content = str_replace('${API_BASE_URL}/candidates/uploads/${candidate.photo}', '${API_BASE_URL}/../uploads/candidates/photos/${candidate.photo}', $content);
    $content = str_replace('${API_BASE_URL}/candidates/uploads/${c.photo}', '${API_BASE_URL}/../uploads/candidates/photos/${c.photo}', $content);
    $content = str_replace('${API_BASE_URL}/candidates/uploads/${form.photo}', '${API_BASE_URL}/../uploads/candidates/photos/${form.photo}', $content);
    $content = str_replace('${API_BASE_URL}/candidates/uploads/${item.image}', '${API_BASE_URL}/../uploads/candidates/photos/${item.image}', $content);
    
    // candidate.resume, form.resume -> /resumes/
    $content = str_replace('${API_BASE_URL}/candidates/uploads/${candidate.resume}', '${API_BASE_URL}/../uploads/candidates/resumes/${candidate.resume}', $content);
    $content = str_replace('${API_BASE_URL}/candidates/uploads/${form.resume}', '${API_BASE_URL}/../uploads/candidates/resumes/${form.resume}', $content);
    
    // doc.rawName -> /documents/
    $content = str_replace('${API_BASE_URL}/candidates/uploads/${doc.rawName}', '${API_BASE_URL}/../uploads/candidates/documents/${doc.rawName}', $content);

    if ($original !== $content) {
        file_put_contents($path, $content);
        echo "Updated $path\n";
    }
}
?>
