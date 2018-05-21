<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 12.05.2018
 * Time: 21:03
 */

namespace PongAjax;


use PongAjax\PongAjax\PosHandler;

class PosGetter implements PosHandler {
    private $reader;

    /**
     * PosGetter constructor.
     * @param FileReader $fileReader
     */
    public function __construct(FileReader $fileReader) {
        $this->reader = $fileReader;
    }

    /**
     * @param $data
     * @return array
     * @throws \Exception
     */
    public function player1($data) {
        return $this->getPlayerData($data, 'player1');
    }

    /**
     * @param $data
     * @return array
     * @throws \Exception
     */
    public function player2($data) {
        return $this->getPlayerData($data, 'player2');
    }

    /**
     * @param $data
     * @return bool
     */
    private function dataValid($data) {
        return isset($data->pos);
    }

    /**
     * @param $data
     * @param $player
     * @return array
     * @throws \Exception
     */
    private function getPlayerData($data, $player) {
        if(!$this->dataValid($data)) {
            return ['error' => 'player-data not valid'];
        }
        do {
            $dataStr = $this->reader->$player(null);
            if($dataStr !== '""') {
                $dataObj = json_decode($dataStr);
                if($dataObj !== null) {
                    $pos = $dataObj->pos;
                } else {
                    $pos = null;
                }
            } else {
                return ['response' => ['pos' => null]];
            }
        } while ($pos === $data->pos || $pos === null);
        return ['response' => ['pos' => $pos]];
    }
}