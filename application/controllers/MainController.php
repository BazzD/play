<?php
class MainController extends Zend_Controller_Action {

    public static $filename = '';
    
    public function init() {
        self::$filename =  APPLICATION_PATH . '/../data/xml/sencha.xml';
        $this->_helper->layout->setLayout('extjs');
    }
    public function indexAction() {


    }
    public function listAction() {
        
        $query = "//item" ;
        $articles = array();

        $q = $this->getRequest()->getParam('q', '');
        if(!empty($q)){
            $query = "//item[contains(title/text(),'".$q."')]" ;
        }
        $doc = new DOMDocument;
        $doc->Load(self::$filename);
        $xpath = new DOMXPath($doc);
        $entries = $xpath->query($query);
        foreach ($entries as $entry) {
            $article = array();
            foreach ($entry->childNodes as $node) {
                $article[$node->nodeName] = $node->nodeValue;
            }
            $articles[] = $article; 
        }
        $result = array('success' => true,'articles' => $articles);
        $this->_helper->json($result);

    }
    public function createAction(){

        $title = $this->getRequest()->getPost('title', null);
        $content = $this->getRequest()->getPost('content', null);

        if(!empty($title) &! empty($content)){
            $link = $this->getRequest()->getPost('link', '');
            $author = $this->getRequest()->getPost('author', '');
            $category = $this->getRequest()->getPost('category', '');

            $xml = simplexml_load_file(self::$filename);
            $item = $xml->channel->addChild('item');

            $item->addChild('title', $title);
            $item->addChild('link', $link);
            $item->addChild('pubDate', date('r'));
            $item->addChild('author', $author);
            $item->addChild('category', $category);
            $item->addChild('content', $content);

            $xml->asXML(self::$filename);

            $result = array(
                'success' => true,
                'msg'=> 'Your new entry is saved.'
            );

        }
        else{
            $result = array(
                'success' => false,
                'msg'=> 'The fields "Title" and "Content" are mandatory. '
            );
        }
        $this->_helper->json($result);

    }
}