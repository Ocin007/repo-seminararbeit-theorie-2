<?php
/**
 * Created by IntelliJ IDEA.
 * User: nwalter
 * Date: 06.05.2018
 * Time: 20:03
 */

namespace PongAjax;


class PongRequest {
    private $type;
    private $data;

    /**
     * PongRequest constructor.
     * @param string|null $requestStr
     */
    public function __construct($requestStr) {
        $request = json_decode($requestStr);
        if($request === NULL || !(isset($request->type))) {
            $this->type = NULL;
            $this->data = NULL;
        } else {
            $this->type = $request->type;
            $this->data = $request->data;
        }
    }

    /**
     * @return string
     */
    public function getType() {
        return $this->type;
    }

    /**
     * @return mixed
     */
    public function getData() {
        return $this->data;
    }
}