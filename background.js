chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	opt.message = request.greeting
    chrome.notifications.create(opt, callback);
    sendResponse({farewell: "goodbye"});
  });
  
  opt = {
	
	type:"basic",
	title:"Alert!",
	message:" ",
	iconUrl:"CT.png"  
  };
  
//chrome.notifications.create(opt, callback)

function callback(){
	
	console.log("popUp")
};
// Then show the notification.
