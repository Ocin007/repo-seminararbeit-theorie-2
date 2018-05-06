<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 21:38
 */

namespace PongAjax;


class FilePersister {
    private $manager;

    /**
     * FilePersister constructor.
     * @param FileManager $fileManager
     */
    public function __construct(FileManager $fileManager) {
        $this->manager = $fileManager;
    }

    /**
     * @param mixed $content
     * @throws \Exception
     */
    public function player1($content) {
        $this->write($this->manager->getPlayer1(), $content);
    }

    /**
     * @param mixed $content
     * @throws \Exception
     */
    public function player2($content) {
        $this->write($this->manager->getPlayer2(), $content);
    }

    /**
     * @param string|int $content
     * @throws \Exception
     */
    public function timestamp($content) {
        $this->write($this->manager->getTimestampFile(), $content);
    }

    /**
     * @param string $file
     * @param mixed $content
     * @throws \Exception
     */
    private function write($file, $content) {
        $jsonStr = json_encode($content);
        if($jsonStr === false) {
            throw new \Exception('content to write cannot be convertet to json');
        }
        $bool = file_put_contents($file, $jsonStr);
        if($bool === false) {
            throw new \Exception('cannot write to file');
        }
    }
}