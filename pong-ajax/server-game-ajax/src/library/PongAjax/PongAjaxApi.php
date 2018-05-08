<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 19:53
 */

namespace PongAjax;


class PongAjaxApi {
    const PLAYER_1 = __DIR__.'/../../players/player1.txt';
    const PLAYER_2 = __DIR__.'/../../players/player2.txt';
    const TIMESTAMP_FILE = __DIR__.'/../../../timestamp.txt';

    const TYPE_CONNECT = 'connect';
    const TYPE_CLEAR = 'clear';
    const TYPE_POS_GET = 'pos-get';//TODO: Zurücksenden der Position des anderen Spielers (long-polling)
    const TYPE_POS_SET = 'pos-set';//TODO: Setzen der Position des Spielers
    const TYPE_TIMER = 'timer';//TODO: Zurücksenden des Timestamp (long-polling)

    private $request;
    private $response;
    private $fileManager;
    private $fileReader;
    private $filePersister;
    private $timer;
    private $connector;

    /**
     * PongAjaxApi constructor.
     * @param $paramArray
     * @throws \Exception
     */
    public function __construct($paramArray) {
        if(!isset($paramArray['request'])) {
            $paramArray['request'] = NULL;
        }
        $this->request = new PongRequest($paramArray['request']);
        $this->fileManager = new FileManager(PongAjaxApi::PLAYER_1, PongAjaxApi::PLAYER_2, PongAjaxApi::TIMESTAMP_FILE);
        $this->fileReader = new FileReader($this->fileManager);
        $this->filePersister = new FilePersister($this->fileManager);
        $this->timer = new Timer($this->fileReader, $this->filePersister);
        $this->connector = new Connector($this->fileReader, $this->filePersister);
//        $this->disconnector = new Disconnector($this->fileReader, $this->filePersister);
//        $this->posGetter = new PosGetter($this->fileReader);
//        $this->posSetter = new PosSetter($this->filePersister);
    }

    /**
     * @throws \Exception
     */
    public function execute() {
        switch($this->request->getType()) {
            case PongAjaxApi::TYPE_CONNECT: $this->connectPlayer(); break;
            case PongAjaxApi::TYPE_CLEAR: $this->clearAllFiles(); break;
            default: $this->response = ['error' => 'undefined type of request'];
        }
    }

    /**
     * @return mixed
     */
    public function getResponse() {
        return $this->response;
    }

    /**
     * @throws \Exception
     */
    private function connectPlayer() {
        if($this->connector->isFull()) {
            $this->response = [
                'response' => [
                    'uuid' => NULL,
                    'number' => NULL
                ]
            ];
        } else {
            $this->response = ['response' => $this->connector->connectPlayer()];
            if($this->connector->isFull()) {
                $this->timer->set();
            }
        }
    }

    /**
     * @throws \Exception
     */
    private function clearAllFiles() {
        $this->filePersister->player1('');
        $this->filePersister->player2('');
        $this->filePersister->timestamp('');
        $this->response = ['response' => 'all cleared'];
    }
}