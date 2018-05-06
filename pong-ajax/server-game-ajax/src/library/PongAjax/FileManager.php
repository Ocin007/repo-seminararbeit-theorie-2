<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 21:14
 */

namespace PongAjax;


class FileManager {

    private $player1;
    private $player2;
    private $timestampFile;

    /**
     * FileManager constructor.
     * @param string $player1
     * @param string $player2
     * @param string $timestampFile
     * @throws \Exception
     */
    public function __construct($player1, $player2, $timestampFile) {
        $this->player1 = $player1;
        $this->player2 = $player2;
        $this->timestampFile = $timestampFile;
        $this->validate();
    }

    /**
     * @return string
     */
    public function getPlayer1() {
        return $this->player1;
    }

    /**
     * @return string
     */
    public function getPlayer2() {
        return $this->player2;
    }

    /**
     * @return string
     */
    public function getTimestampFile() {
        return $this->timestampFile;
    }

    /**
     * @throws \Exception
     */
    private function validate() {
        if(!(is_file($this->player1) && is_file($this->player2) && is_file($this->timestampFile))) {
            throw new \Exception('cannot find files');
        }
    }
}