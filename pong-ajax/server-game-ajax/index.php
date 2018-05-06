<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 29.04.2018
 * Time: 20:44
 */
require_once __DIR__.'/../../vendor/autoload.php';

use PongAjax\PongAjaxApi;


error_reporting(E_ALL);
ini_set('display_errors', 'on');


try {
    $api = new PongAjaxApi($_POST);
    $api->execute();
    $response = $api->getResponse();
} catch (Exception $e) {
    $response = ['exception' => $e->getMessage()];
}
echo json_encode($response, JSON_PRETTY_PRINT);