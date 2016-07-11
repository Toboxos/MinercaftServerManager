var Session = new function() {
	
	/* SESSION ARRAY */
	this.sessions = [];
	
	/* GENERATRE A RANDOM TOKEN FOR A NEW SESSION */
	this.addSession = function(res, data) {
		var token = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		do {
			for( var i=0; i < 16; i++ ) token += possible.charAt(Math.floor(Math.random() * possible.length));
		} while( token in sessions ); 
		
		var session = [];
		session['time'] = Date.now();
		session['data'] = data;
		this.sessions[token] = session;
		res.setHeader('Set-Cookie', 'session=' + token);
		return token;
	}
	
	/* TEST IF SESSION WITH DATA EXISTS */
	this.existSession = function(req) {
		var cookies = getCookies(req);
		
		/* User hat keinen Cookie mit dem Namen 'session' */
		if( !exists(cookies['session']) ) return false;
		var session = cookies['session'];
		
		/* Sessionkey existiert nicht */
		if( !exists(this.sessions[session]) ) return false;
		var details = this.sessions[session];
		
		/* Differenz zwischen der Zeit, wann der Cookies erstell wurde und der jetzigen Zeit ausrechnen */
		var time = details['time'];
		var currentTime = Date.now();
		var difference = currentTime - time;
		
		/* Session ist abgelaufen */
		if(difference > 900000 ) {
			delete this.sessions[session];	// Session löschen
			return false;
		}
		
		/* Zeit der Session aktualisieren */
		this.sessions[session]['time'] = Date.now();
		
		/* Session existiert und ist nicht abgelaufen */
		return true;
	}
	
	/* DELETE A SESSION */
	this.destroySession = function(name) {
		delete sessions[name];
	}
	
	/* GET COOKIES FROM A REQUEST */
	this.getCookies = function(req) {
		var list = [];
		if( !exists(req.headers.cookie) ) return list;
		req.headers.cookie.split(';').forEach(function(item, index) {
			var parts = item.split('=');
			list[parts.shift().trim()] = parts.join('=');
		});
		return list;
	}
}