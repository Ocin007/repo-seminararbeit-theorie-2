<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 21:18
 */

namespace PongAjax;


class FileReader {
    private $manager;

    /**
     * FileReader constructor.
     * @param FileManager $fileManager
     */
    public function __construct(FileManager $fileManager) {
        $this->manager = $fileManager;
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    public function player1() {
        return $this->read($this->manager->getPlayer1());
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    public function player2() {
        return $this->read($this->manager->getPlayer2());
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    public function timestamp() {
        return $this->read($this->manager->getTimestampFile());
    }

    /**
     * @param string $file
     * @return bool|string
     * @throws \Exception
     */
    private function read($file) {
        $content = file_get_contents($file);
        if($content === false) {
            throw new \Exception('failed to read file');
        }
        return $content;
    }
}