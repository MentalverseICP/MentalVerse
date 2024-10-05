<?php
	include('constants.php');
	$db = new mysqli(HOST,USER,PASS,DB);
	if($db->connect_errno){
		die("Error connecting to database");
	}
  


	function get_extension($name){
		$ext = pathinfo($name);
		$file_ext = $ext['extension'];
		return $file_ext;
	}

function trim_all( $str , $what = NULL , $with = ' ' )
{
    if( $what === NULL )
    {
        //  Character      Decimal      Use
        //  "\0"            0           Null Character
        //  "\t"            9           Tab
        //  "\n"           10           New line
        //  "\x0B"         11           Vertical Tab
        //  "\r"           13           New Line in Mac
        //  " "            32           Space
        $what   = "\\x00-\\x20";    //all white-spaces and control chars
    }
    return trim( preg_replace( "/[".$what."]+/" , $with , $str ) , $what );
}	
