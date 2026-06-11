<?php
session_start();

$captcha_code = '';
$characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
$characters_length = strlen($characters);
for ($i = 0; $i < 6; $i++) {
    $captcha_code .= $characters[rand(0, $characters_length - 1)];
}

$_SESSION['captcha_code'] = $captcha_code;

header('Content-Type: image/png');
$image = imagecreate(120, 40);
$background_color = imagecolorallocate($image, 255, 255, 255);
$text_color = imagecolorallocate($image, 0, 0, 0);
$font = __DIR__ . '/arial.ttf'; // Path to a TrueType font file
imagettftext($image, 20, 0, 10, 30, $text_color, $font, $captcha_code);
imagepng($image);
imagedestroy($image);
?>
