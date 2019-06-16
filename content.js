//Setting the extension UI
tool_template = chrome.extension.getURL ("page.html");
localStorage.auto_state = 0
$.get(tool_template , function( data ) {
	$( "#app" ).append(data);
});

$(function(){  
	function open_order_change() {
		if( parseInt( localStorage.auto ) != 1){
			// Orders
			orders = $(".styles__openOrders__2y7-l .gJEpOB")
			orders_nb = parseInt(orders.length/6-1)
			
			// Monitor **
			if(orders_nb >= localStorage.orders_nb)
				localStorage.orders_nb = orders_nb
			else if (!(localStorage.auto_state == "3" || localStorage.auto_state == "6")){
				call_alert("Order has disappeared","orders")
				localStorage.orders_nb = orders_nb
			}
		}
			
	};
	function order_book_change() {
			getValues();
	};
	function monitor_gap_value_change(){
		localStorage.monitor_gap_value = $("#claude_tool_monitor_gap_input").val()
	}
	function claude_tool_ask_max_change(){
		localStorage.max_ask = $("#claude_tool_ask_max").val()
	}
	function claude_tool_ask_withdraw(){
		localStorage.withdraw = $("#claude_tool_ask_withdraw").val()
	}
	function claude_tool_integer(){
		localStorage.integer = $('#claude_tool_integer').is(':checked')
	}
	// Bind the debounced handler to the keyup event.
	$('html').on('DOMSubtreeModified', '.styles__orderBook__3t2LI .gJEpOB', $.debounce( 1000, order_book_change ));
	$('html').on('DOMSubtreeModified', '.styles__openOrders__2y7-l', $.debounce( 2000, open_order_change ));
	$('html').on('keyup', "#claude_tool_monitor_gap_input",$.debounce( 100, monitor_gap_value_change ));
	$('html').on('keyup', "#claude_tool_ask_max",$.debounce( 100, claude_tool_ask_max_change ));
	$('html').on('keyup', "#claude_tool_ask_withdraw",$.debounce( 100, claude_tool_ask_withdraw ));
	$('html').on('change', "#claude_tool_integer",$.debounce( 100, claude_tool_integer ));
	
});

function call_alert(input,type){
	if($("#alert_box").val() == "alert" && !parseInt(localStorage.auto))
	window.setTimeout(function() { alert(input)} , 500);
	else if(!parseInt(localStorage.auto) && $("#alert_box").val() == "notification"){
		chrome.runtime.sendMessage({greeting: input}, function(response) {
		//console.log(response.farewell);
		});
	}
	if(!parseInt(localStorage.sound))
		document.getElementById(type).play();
}
function getValues() {
	// Check Box
	if($("#automatic_mode").is(':checked'))
		localStorage.auto = 1;
	else
		localStorage.auto = 0;
	if($("#sound_alert").is(':checked'))
		localStorage.sound = 1;
	else
		localStorage.sound = 0;
	
	if(typeof localStorage.bid_cad != 'undefined'){
		$("#claude_tool_last_bid").text(localStorage.last_bid) 
	}
	if(typeof localStorage.ask_cad != 'undefined'){
		$("#claude_tool_last_ask").text(localStorage.last_ask) 
	}
	order_book = $('.styles__orderBook__3t2LI .gJEpOB')  	
	holding = $(".styles__holdingsBox__25daD .kkFBOY")
	
	var bid
	var ask
	
	order_book.css("background-color", "");
	
	for(var i=0;i<8;i++){
		if(order_book[10+i*8].textContent.replace(",", "") > 250 && (order_book[11+i*8].textContent-order_book[19+i*8].textContent)*100000000 < 15){
			bid = order_book[10+i*8+1].textContent
			$(order_book[10+i*8+1]).css("background-color", "yellow");
			localStorage.bid_cad = order_book[10+i*8].textContent.replace(",", "")
			break
		}
	}
	for(var i=0;i<8;i++){
		if(order_book[13+i*8].textContent.replace(",", "") > 500 && (order_book[20+i*8].textContent-order_book[12+i*8].textContent)*100000000 < 18){
			ask = order_book[13+i*8-1].textContent
			$(order_book[13+i*8-1]).css("background-color", "yellow");
			localStorage.ask_cad = order_book[13+i*8].textContent.replace(",", "")
			break
		}
	}
	var gap_value = (Math.round(((ask/bid)*100-100)*100))/100
	
	// Orders
	orders = $(".styles__openOrders__2y7-l .gJEpOB")
	orders_nb = parseInt(orders.length/6-1)
	order_book.css( "color", "black" );	
	
	localStorage.is_ask = 0;
	localStorage.is_bid = 0;
		
	// Get orders in order book
	for(var i = 0;i<orders_nb;i++){
		var test = 1;
		$( ".styles__orderBook__3t2LI .gJEpOB:contains('"+orders[8+i*6].textContent+"')" ).css( "color", "red" );
		if(orders[6+i*6].textContent == "sell"){
			localStorage.is_ask = 1;
			localStorage.ask_ratio = orders[8+i*6].textContent
			}
		if(orders[6+i*6].textContent == "buy"){
			localStorage.is_bid = 1;
			localStorage.bid_ratio  = orders[8+i*6].textContent
		}
	}
	
	//Get holding
	if($(".styles__holdingsBox__25daD .ggpTzC")[1].textContent == "CAD"){
		var CAD = holding[1].textContent
		var BTC = holding[2].textContent
		var BTC_CAD = $(".styles__holdingsBox__25daD .bjzkWq")[2].textContent
	}
	else{
		var CAD = "0";
		var BTC = holding[1].textContent;
	}	
	
	if(parseFloat(localStorage.max_ask) > (CAD - parseInt(localStorage.withdraw)))
		localStorage.claude_tool_cad_holding = (CAD - parseInt(localStorage.withdraw))
	else
		localStorage.claude_tool_cad_holding = localStorage.max_ask
	
	if($(this).hasClass("claudes_tool_get")){
		$("#claude_tool_bid_ratio").text(bid)
		$("#claude_tool_ask_ratio").text(ask)
		$("#claude_tool_bid_CAD").text((Math.round((((BTC/bid)-0.05)*100)))/100)
	}
	
	localStorage.claude_tool_bid_btc = BTC
	
	$("#claude_tool_ask_max").val(localStorage.max_ask)	
	$("#claude_tool_ratio").text(gap_value)
	$("#claude_tool_btc_value").text((1/ask).toFixed(1))
	
	var gap = 0;
	gap_input_value = parseFloat($("#claude_tool_monitor_gap_input").val())
	
	if(gap_value > gap_input_value){
		call_alert("gap: " + gap_value,"gap")
		gap = 1;
	}
	
	// Revenue
	var currentdate = new Date(); 
	
	if(localStorage.day !=  currentdate.getDate() && BTC_CAD < 4){
		localStorage.revenue_today = CAD
		localStorage.day = currentdate.getDate()
	}
	
	if(BTC_CAD < 4)
		localStorage.revenue_now = CAD
	$("#claude_tool_revenue").text((parseFloat(CAD)-parseFloat(localStorage.revenue_today)+parseFloat(BTC_CAD)).toFixed(2))
	
	// Under/over alert
	if(!parseInt(localStorage.auto)){
	
		if(parseInt(localStorage.is_ask)){
			if(parseFloat( localStorage.ask_ratio ) > ask )
				call_alert("Under ask!","gap")
			}
		if(parseInt(localStorage.is_bid)){
			if(parseFloat( localStorage.bid_ratio ) < bid )
				call_alert("Under bid!","gap")
		}
	}
	
	
	//Bot
	if(parseInt(localStorage.auto)){
		
			//Setting Date/time
			var autoDate = new Date(); 
                
			var auto_time_now    = currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
		
		
		if(localStorage.auto_state == "0")
		{
			// if ask out of range			
			if(parseInt( localStorage.is_ask ) ){
				// IF (gap && under ask) || (!gap &&  0.8 > ask > 1.2)
				if(BTC_CAD > 10 || (gap && (parseFloat(localStorage.auto_ask) > ask)) || (!gap && ( (localStorage.ask_ratio/bid) > 1.012 || (localStorage.ask_ratio/bid) < 1.008 ))){
					localStorage.auto_state = "3"
					setTimeout(function(){ delay_click(); }, 1000);
					localStorage.auto_previous_state = 2;
				}
			}
			// if is bid
			else if(parseInt( localStorage.is_bid )){
				//if over bit
					if(parseFloat(localStorage.auto_bid) < bid){ // Under ask
					localStorage.auto_state = "6"
					setTimeout(function(){ delay_click(); }, 1000);
					localStorage.auto_previous_state = 5;
				}	
				console.log(auto_time_now+" - Bot - to State "+localStorage.auto_state)
			}
			// if BTC
			else if(parseInt(BTC_CAD) > 4){
				localStorage.auto_state = "4" // If BTC
				setTimeout(function(){ delay_click(); }, 2000);
				localStorage.auto_previous_state = 0;
			}
			else if(!parseInt( localStorage.is_ask)){	
				localStorage.auto_state = "1" // Send ask
				setTimeout(function(){ delay_click(); }, 2000);
				localStorage.auto_previous_state = 0;
			}
			console.log(auto_time_now+" - Bot 0 - to State "+localStorage.auto_state)
		}
		else if(localStorage.auto_state == "1" && !orders_nb)
		{
			//Push ask
			if(gap){
				diff = Math.floor(Math.random() * 4) + 2 
				localStorage.auto_ask = (parseFloat(ask)-parseInt(diff)/100000000).toFixed(8); // To modify!!
			}
			else{
				localStorage.auto_ask = (parseFloat(bid*1.01).toFixed(8)); // To modify!!
			}
			cash = $("#claude_tool_auto_cash").val()
			console.log(auto_time_now+" - Bot - State 1")
			$("#claude_tool_ask_ratio").text(localStorage.auto_ask)
			$(".claude_tool_push.ask").click();
			localStorage.auto_state = 0
			localStorage.auto_previous_state = 1;
			currentdate = new Date()
			console.log(auto_time_now+" - Bot - Ask sent! Ratio: " + localStorage.auto_ask)
			return
		}
		else if(localStorage.auto_state == "3")
		{
			//Cancel order
			if(!orders_nb){
				localStorage.auto_state = "0"
				localStorage.auto_previous_state = 3;
				console.log("No more orders..")
				setTimeout(function(){ delay_click(); }, 1000);
				return
			}
			console.log(auto_time_now+" - Bot - State 3")
			$(".styles__cancel__1AS5F").click()
			setTimeout(function(){ delay_click(); }, 5000);
			console.log(auto_time_now+" - Bot - Ask Canceled. me :" + localStorage.ask_ratio +" them: " + ask)
			
		}
		else if(localStorage.auto_state == "4" && !orders_nb)
		{
			// Push bid
			console.log(auto_time_now+" - Bot - State 4")
			diff = Math.floor(Math.random() * 3) + 3
			bid = (parseFloat(bid)+parseInt(diff)/100000000).toFixed(8);
			$("#claude_tool_bid_ratio").text(bid)
			$("#claude_tool_bid_BTC").val(BTC)
			$("#claude_tool_bid_CAD").text((Math.round((((BTC/bid)-0.05)*100)))/100)
			$(".claude_tool_push.bid").click();
			localStorage.auto_bid = bid
			localStorage.auto_state = 0
			localStorage.auto_previous_state = 4;
			console.log(auto_time_now+" - Bot - Bid Sent! ratio: " + bid + "CAD: " + $("#claude_tool_bid_CAD").text())
			return			
		}
		else if(localStorage.auto_state == "6")
		{
			//Cancel order
			if(!orders_nb){
				localStorage.auto_state = "0"
				localStorage.auto_previous_state = 6;
				console.log("No more orders..")
				setTimeout(function(){ delay_click(); }, 1000);
				return
			}

			$(".styles__cancel__1AS5F").click()

			setTimeout(function(){ delay_click(); }, 5000);
			console.log(auto_time_now+" 6 Bot - Bid Canceled me: " + localStorage.bid_ratio +" them: "+ bid)
			
		}
		else{
			localStorage.auto_state = "0"
		}
	}
}; 
function delay_click(){
	$(".claudes_tool_get").click()
}
function plus(){

	if(!parseFloat($("#claude_tool_bid_ratio").text()) || !parseFloat($("#claude_tool_ask_ratio").text())){
		$("#claudes_tool_get_id").click()
		return
	}
	
	var valueNow = (parseFloat($("#claude_tool_bid_ratio").text())+ parseInt(this.value)/100000000).toFixed(8)
	$("#claude_tool_bid_ratio").text(valueNow)
	BTC = parseFloat(localStorage.claude_tool_bid_btc).toFixed(8)
	$("#claude_tool_bid_CAD").text((Math.round((((BTC/valueNow)-0.05)*100)))/100)
	
	var valueNow = (parseFloat($("#claude_tool_ask_ratio").text())+ parseInt(this.value)/100000000).toFixed(8)
	$("#claude_tool_ask_ratio").text(valueNow)

}
function claude_tool_push() {
	input_ratio = document.getElementsByName("limitPrice")
	input_quantity = document.getElementsByName("quantity")
		
	if($(this).hasClass("bid")){
		if(localStorage.integer == "false")
			CAD = Math.floor(parseFloat($("#claude_tool_bid_CAD").text())*100)/100
		else
			CAD = parseInt(Math.floor(parseFloat($("#claude_tool_bid_CAD").text())*100)/100)
			
		input_ratio[0].value = $("#claude_tool_bid_ratio").text()
		input_quantity[0].value = CAD
	}
	else if($(this).hasClass("ask")){
		input_ratio[0].value = $("#claude_tool_ask_ratio").text()
		input_quantity[0].value = Math.floor(parseFloat(localStorage.claude_tool_cad_holding)*100-2)/100
	}	
	input_ratio[0].focus();
	input_quantity[0].focus();
	input_ratio[0].focus();
	
	
	if($(this).hasClass("bid")){
		document.getElementsByClassName("styles__btnBuy__iuoFQ")[0].click()
		if(parseFloat($(".styles__right__2FaWm.gUWRKL")[1].textContent) == parseFloat($("#claude_tool_bid_ratio").text())){
			console.log("Bid Good order!")
			$("#claude_tool_last_bid").text($("#claude_tool_bid_ratio").text())
			localStorage.last_bid = $("#claude_tool_bid_ratio").text()
		}
		else{
			console.log("Bid bad order!")
			$(".styles__cancelBtn__3skB2").click()
		}
	}
	else if($(this).hasClass("ask")){
		document.getElementsByClassName("styles__tradeSell__29BGY")[0].click()
		if(parseFloat($(".styles__right__2FaWm.gUWRKL")[1].textContent) == parseFloat($("#claude_tool_ask_ratio").text())){
			//$(".styles__confirmBtn__1saju").click()
			//return
			console.log("Bid Good order!")
			$("#claude_tool_last_ask").text($("#claude_tool_ask_ratio").text())
			localStorage.last_ask = $("#claude_tool_ask_ratio").text()
		}
		else{
			console.log("ask Bad order!")
			$(".styles__cancelBtn__3skB2").click()
		}
	}
	$(".styles__confirmBtn__1saju").click()
}
function claude_tool_alert(){
	localStorage.alert_box = $("#alert_box").val()
}
$( document ).ready(function() {
    if(typeof localStorage.monitor_gap_value == 'undefined'){
		localStorage.monitor_gap_value = 0.7
	}
	if(typeof localStorage.withdraw == 'undefined'){
		localStorage.withdraw = 0
	}
	if(typeof localStorage.sound !== 'undefined' && parseInt(localStorage.sound)){
		 $("#sound_alert").prop("checked", true);
	}
	if(typeof localStorage.integer !== 'undefined' && localStorage.integer == "true"){
		 $("#claude_tool_integer").prop("checked", true);
	}
	if(typeof localStorage.alert !== 'undefined' && parseInt(localStorage.alert)){
		 $("#alert_box").prop("checked", true);
	}
	if(typeof localStorage.alert_box !== 'undefined'){
		if(localStorage.alert_box == "notification")
			$("#alert_box").val("notification");
		else if(localStorage.alert_box == "alert")
			$("#alert_box").val("alert");
		else
			$("#alert_box").val("no");
	}
	
	if(typeof localStorage.day == 'undefined'){
		localStorage.day = 0	
	}
	
	if(typeof localStorage.alert !== 'undefined')
		$("#claude_tool_ask_withdraw").val(localStorage.withdraw)
	else
		$("#claude_tool_ask_withdraw").val(0)

	localStorage.orders_nb = 0
	$("#claude_tool_monitor_gap_input").val(parseFloat(localStorage.monitor_gap_value))
	
	$('html').on('click', ".claudes_tool_get",getValues);	
	$('html').on('click', ".claude_tool_plus",plus);
	$('html').on('click', ".claude_tool_push",claude_tool_push);
	$('html').on('change', "#alert_box",claude_tool_alert);
	getValues()
		
});