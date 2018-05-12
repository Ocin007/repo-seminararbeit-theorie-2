<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 12.05.2018
 * Time: 21:05
 */

namespace PongAjax\PongAjax;


interface PosHandler {
    public function player1($data);
    public function player2($data);
}