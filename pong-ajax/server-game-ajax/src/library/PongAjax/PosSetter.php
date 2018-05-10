<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 09.05.2018
 * Time: 19:36
 */

namespace PongAjax;


class PosSetter {
    private $persister;

    /**
     * PosSetter constructor.
     * @param FilePersister $filePersister
     */
    public function __construct($filePersister) {
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
        return isset($data['uuid']) && isset($data['pos']);
    }

    /**
     * @param $data
     * @param $string
     * @return array
     * @throws \Exception
     */
    private function setPlayerData($data, $string) {
        if(!$this->dataValid($data)) {
            return ['error' => 'player-data not valid'];
        }
        $content = [
            'uuid' => $data['uuid'],
            'pos' => $data['pos']
        ];
        $this->persister[$string]($content);
        return ['response' => 'set pos to '.$data['pos']];
    }
}