<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 09.05.2018
 * Time: 19:36
 */

namespace PongAjax;


use PongAjax\PongAjax\PosHandler;

class PosSetter implements PosHandler {
    private $persister;

    /**
     * PosSetter constructor.
     * @param FilePersister $filePersister
     */
    public function __construct(FilePersister $filePersister) {
        $this->persister = $filePersister;
    }

    /**
     * @param $data
     * @return array
     * @throws \Exception
     */
    public function player1($data) {
        return $this->setPlayerData($data, 'player1');
    }

    /**
     * @param $data
     * @return array
     * @throws \Exception
     */
    public function player2($data) {
        return $this->setPlayerData($data, 'player2');
    }

    /**
     * @param $data
     * @return bool
     */
    private function dataValid($data) {
        return isset($data->uuid) && isset($data->pos);
    }

    /**
     * @param $data
     * @param $player
     * @return array
     * @throws \Exception
     */
    private function setPlayerData($data, $player) {
        if(!$this->dataValid($data)) {
            return ['error' => 'player-data not valid'];
        }
        $content = [
            'uuid' => $data->uuid,
            'pos' => $data->pos
        ];
        $this->persister->$player($content);
        return ['response' => 'set pos to '.$data->pos];
    }
}