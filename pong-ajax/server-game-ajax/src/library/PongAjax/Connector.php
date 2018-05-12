<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 21:49
 */

namespace PongAjax;


class Connector {
    private $reader;
    private $persister;

    /**
     * Connector constructor.
     * @param FileReader $fileReader
     * @param FilePersister $filePersister
     */
    public function __construct(FileReader $fileReader, FilePersister $filePersister) {
        $this->reader = $fileReader;
        $this->persister = $filePersister;
    }

    /**
     * @return bool
     * @throws \Exception
     */
    public function isFull() {
        return $this->reader->player1(null) != '""' && $this->reader->player2(null) != '""';
    }

    /**
     * @return array
     * @throws \Exception
     */
    public function connectPlayer() {
        $uuid = uniqid();
        $playerJson = [
            'uuid' => $uuid,
            'pos' => 0
        ];
        if($this->reader->player1(null) == '""') {
            $number = 1;
            $this->persister->player1($playerJson);
        } else {
            $number = 2;
            $this->persister->player2($playerJson);
        }
        return ['uuid' => $uuid, 'number' => $number];
    }
}