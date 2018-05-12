<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 22:37
 */

namespace PongAjax;
use DateTime;

class Timer {
    const TIME_BUFFER = 5000;

    private $reader;
    private $persister;

    /**
     * Timer constructor.
     * @param FileReader $fileReader
     * @param FilePersister $filePersister
     */
    public function __construct(FileReader $fileReader, FilePersister $filePersister) {
        $this->reader = $fileReader;
        $this->persister = $filePersister;
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    public function get() {
        return $this->reader->timestamp(null);
    }

    /**
     * @throws \Exception
     */
    public function set() {
        $date = new DateTime();
        $timestamp = $date->getTimestamp() + Timer::TIME_BUFFER;
        $this->persister->timestamp($timestamp);
    }

    /**
     * @throws \Exception
     */
    public function reset() {
        $this->persister->timestamp('');
    }
}