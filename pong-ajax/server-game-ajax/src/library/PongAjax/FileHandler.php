<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 12.05.2018
 * Time: 21:27
 */

namespace PongAjax\PongAjax;


interface FileHandler {
    public function player1($content);
    public function player2($content);
    public function timestamp($content);
}