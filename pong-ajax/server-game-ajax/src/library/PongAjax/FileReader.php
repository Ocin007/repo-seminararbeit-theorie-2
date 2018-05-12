<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 21:18
 */

namespace PongAjax;


use PongAjax\PongAjax\FileHandler;

class FileReader implements FileHandler {
    private $manager;

    /**
     * FileReader constructor.
     * @param FileManager $fileManager
     */
    public function __construct(FileManager $fileManager) {
        $this->manager = $fileManager;
    }

    /**
     * Parameter $content is not used
     * @param null $content
     * @return bool|string
     * @throws \Exception
     */
    public function player1($content) {
        return $this->read($this->manager->getPlayer1());
    }

    /**
     * Parameter $content is not used
     * @param null $content
     * @return bool|string
     * @throws \Exception
     */
    public function player2($content) {
        return $this->read($this->manager->getPlayer2());
    }

    /**
     * Parameter $content is not used
     * @param null $content
     * @return bool|string
     * @throws \Exception
     */
    public function timestamp($content) {
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