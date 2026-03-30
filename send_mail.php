<?php
function smtp_command($connection, $command, $expectedCode) {
    if ($command !== null) {
        fwrite($connection, $command . "\r\n");
    }

    $response = '';
    while (($line = fgets($connection, 515)) !== false) {
        $response .= $line;
        if (substr($line, 3, 1) === ' ') {
            break;
        }
    }

    $code = intval(substr($response, 0, 3));
    if ($code !== $expectedCode) {
        throw new RuntimeException("SMTP error: expected {$expectedCode}, got {$code}. Response: {$response}");
    }

    return $response;
}

function renderPage($title, $message, $success = false) {
    $color = $success ? '#10b981' : '#f97316';
    echo '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' . htmlspecialchars($title) . '</title></head><body style="font-family:Arial, sans-serif;background:#050510;color:#eef2ff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="max-width:520px;padding:28px;border-radius:20px;background:rgba(15,23,42,0.95);border:1px solid rgba(255,255,255,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.35);"><h1 style="margin-top:0;color:' . $color . ';">' . htmlspecialchars($title) . '</h1><p style="line-height:1.8;color:#cbd5e1;">' . nl2br(htmlspecialchars($message)) . '</p><p><a href="index.html" style="display:inline-block;margin-top:18px;padding:12px 20px;border-radius:999px;background:#2563eb;color:#fff;text-decoration:none;">Retour au site</a></p></div></body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    renderPage('Méthode non autorisée', 'Ce script accepte uniquement les envois POST.');
}

$name = trim($_POST['user_name'] ?? '');
$email = trim($_POST['user_email'] ?? '');
$subject = trim($_POST['subject'] ?? 'Nouveau message depuis le portfolio');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    renderPage('Informations manquantes', 'Merci de remplir votre nom, votre email et votre message.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    renderPage('Email invalide', 'Merci de saisir une adresse email valide.');
}

// Paramètres SMTP
$smtpHost = 'smtp.gmail.com';
$smtpPort = 587;
$smtpUser = 'rubenkagbanon@gmail.com';
$smtpPass = 'hrdy oymw dycx lrmu';
$toAddress = 'rubenkagbanon@gmail.com';

$body = "Vous avez reçu un nouveau message depuis le portfolio :\r\n\r\n";
$body .= "Nom : {$name}\r\n";
$body .= "Email : {$email}\r\n";
$body .= "Objet : {$subject}\r\n\r\n";
$body .= "Message :\r\n{$message}\r\n";

$connection = @stream_socket_client("tcp://{$smtpHost}:{$smtpPort}", $errno, $errstr, 30);
if (!$connection) {
    renderPage('Échec de connexion', "Impossible de se connecter au serveur SMTP. Erreur : {$errstr} ({$errno})");
}

try {
    smtp_command($connection, null, 220);
    smtp_command($connection, "EHLO localhost", 250);
    smtp_command($connection, "STARTTLS", 220);
    if (!stream_socket_enable_crypto($connection, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new RuntimeException('Impossible d’activer TLS.');
    }
    smtp_command($connection, "EHLO localhost", 250);
    smtp_command($connection, "AUTH LOGIN", 334);
    smtp_command($connection, base64_encode($smtpUser), 334);
    smtp_command($connection, base64_encode($smtpPass), 235);
    smtp_command($connection, "MAIL FROM:<{$smtpUser}>", 250);
    smtp_command($connection, "RCPT TO:<{$toAddress}>", 250);
    smtp_command($connection, "DATA", 354);

    $headers = [];
    $headers[] = 'From: "' . addslashes($name) . '" <' . $smtpUser . '>';
    $headers[] = 'Reply-To: "' . addslashes($name) . '" <' . $email . '>';
    $headers[] = 'To: ' . $toAddress;
    $headers[] = 'Subject: ' . $subject;
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';

    $smtpMessage = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.";
    smtp_command($connection, $smtpMessage, 250);
    smtp_command($connection, "QUIT", 221);
    fclose($connection);

    renderPage('Message envoyé', 'Votre message a bien été envoyé vers rubenkagbanon@gmail.com.');
} catch (RuntimeException $e) {
    fclose($connection);
    renderPage('Erreur SMTP', $e->getMessage());
}
