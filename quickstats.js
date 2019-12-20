"use strict";

(function stats() {
	// Consent and capability
	if ( navigator.doNotTrack || !JSON.stringify ) { return; }
	
	const pkg	= {};
	
	// List of elements to track
	pkg.subjects	=
	'a, p, li, img, h1, input[type="text"], input[type="range"], textarea';
	
	// List of tracking events
	pkg.track	=
	'click, mouseover, mouseout, focus, blur, selectionchange';
	
	// Timeout
	pkg.limit	= 2000;
	
	// Stats collection URL
	pkg.url	= 'https://example.com/stats';
	
	// Stats package version for internal use
	pkg.version		= '0.1';
	
	const
	find	= ( se, el, nl ) => {
		el = el || document;
		const qr = el.querySelectorAll( se );
		if ( nl && qr.length ) {
			return qr[0];
		}
		return qr;
	},
	listen	= ( tg, ev, fn, ca ) => {
		const
		ve	= ev.split( ',' ).map( e => e.trim() ),
		ln	= ve.length;
		ca	= ca || false;
		
		for ( let i = 0; i < ln; i++ ) {
			tg.addEventListener( ve[i], fn, ca );
		}
	},
	record	= ( el, i ) => {
		el.events	= [];
		
		listen( el, pkg.track, ( e ) => {
			var txt = 
			document.getSelection ? 
				document.getSelection().toString() : 
				document.selection.createRange().toString();
			
			el.events.push( [ e.type, i, 
				el.getAttribute( 'id' ) || '', [
				txt,
				el.value || el.src || el.href || '',
				e.pageX || 0, 
				e.pageY || 0,
				e.timeStamp
			] ] );
		}, false );
		
		el.setAttribute( 'data-stats', '1' );
	},
	hearall	= ( tg, ev, fn ) => {
		const
		el	= find( tg ),
		ln	= el.length;
		
		if ( !ln ) { return; }
		
		for( var i = 0; i < ln; i++ ) {
			record( el[i], i );
		}
	},
	collect = () => {
		const
		el	= find( '[data-stats]' ),
		ln	= el.length,
		ev	= [];
		
		if ( !ln ) { return ev; }
		
		for( var i = 0; i < ln; i++ ) {
			const n = {};
			
			n.node		= el[i].nodeName;
			n.events	= el[i].events || [];
			
			ev.push( n );
		}
		return ev;
	},
	send	= () => {
		pkg.events	= collect();
		
		const xhr	= new XMLHttpRequest();
		xhr.timeout	= pkg.limit;
		xhr.open( 'POST', pkg.url, true );
		xhr.setRequestHeader( 
			'Content-Type', 
			'application/x-www-form-urlencoded; charset=UTF-8'
		);
		xhr.send( JSON.stringify( pkg ) );
	};
	
	pkg.load	= Date.now();
	pkg.host	= window.location.host;
	pkg.pathname	= window.location.pathname;
	pkg.hash	= window.location.hash;
	pkg.referrer	= document.referrer;
	pkg.useragent	= navigator.userAgent || '';
	pkg.platform	= navigator.platform || '';
	pkg.screen	= 
	[
		window.screen.width, 
		window.screen.height,
		window.screen.pixelDepth
	];
	
	hearall( pkg.subjects );
	listen( window, 'beforeunload', ( e ) => {
		send();
	}, true );
})();
