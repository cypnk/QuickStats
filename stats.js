"use strict";

(function stats() {
	// Consent and capability
	if ( navigator.doNotTrack || !JSON.stringify ) { return; }
	
	const pkg	= {};
	
	// List of elements and associated events to track
	pkg.observe	= [
		[ 'a', 'click, mousenter, mouseleave, focus' ],
		[ 'p', 'wheel, select' ],
		[ 'li, img, h1', 'mouseenter, mouseleave' ],
		[ 'input[type="text"]', 'mouseover, mouseout, focus, blur, invalid' ],
		[ 'input[type="range"]', 'mouseover, mouseout, focus, change' ],
		[ 'textarea', 'mouseenter, mouseleave, focus, change, invalid' ]
	];
	
	// Timeout
	pkg.limit	= 2000;
	
	// Stats collection URL
	pkg.url		= 'https://example.com/stats';
	
	// This file's name
	pkg.file	= 'stats.js';
	
	// Stats package version for internal use
	pkg.version	= '0.1';
	
	
	// Base settings
	pkg.load	= Date.now();
	pkg.host	= window.location.host;
	pkg.pathname	= window.location.pathname;
	pkg.hash	= window.location.hash;
	pkg.referrer	= document.referrer;
	pkg.useragent	= navigator.userAgent	|| '';
	pkg.platform	= navigator.platform	|| '';
	pkg.screen	= 
	[
		window.screen.width, 
		window.screen.height,
		window.screen.pixelDepth
	];
	
	const
	find	= ( se, el, nl ) => {
		el = el || document;
		const qr = el.querySelectorAll( se );
		if ( nl && qr.length ) {
			return qr[0];
		}
		return qr;
	},
	token	= () => { // stats.js?uniquetoken
		const
		sc	= find( 'script' ),
		ln	= sc.length;
		
		// This is very odd
		if ( !ln ) { return ''; }
		
		var 
		t	= '',
		f	= '';
		for( var i = 0; i < ln; i++ ) {
			f = 
			sc[i].src.replace( /^.*[\\\/]/, '' )
				.split( '?' );
			if ( f[0] == pkg.file ) {
				t = f[1] || '';
				break;
			}
		}
		
		var sh		= 0;
		const ua	=  pkg.useragent + t;
		for ( let i = 0; i < ua.length; i++ ) {
			sh = ( sh * 31 ) + ua.charCodeAt( i );
			sh |= 0;
		}
		
		return btoa( '' + sh );
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
	record	= ( el, ev, i ) => {
		el.events	= [];
		
		listen( el, ev, ( e ) => {
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
	hearall	= ( tg ) => {
		for ( var i = 0; i < tg.length; i++ ) {
			const
			el	= find( tg[i][0] ),
			ln	= el.length;
			
			if ( !ln ) { continue; }
			
			for( var j = 0; j < ln; j++ ) {
				record( el[j], tg[i][1], j );
			}
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
			
			n.node		= el[i].nodeName.toLowerCase();
			n.events	= el[i].events || [];
			
			ev.push( n );
		}
		return ev;
	},
	send	= () => {
		const
		frm		= new FormData(),
		xhr		= new XMLHttpRequest();
		
		xhr.timeout	= pkg.limit;
		pkg.events	= collect();
		
		frm.append( 'stats', JSON.stringify( pkg ) );
		frm.append( 'token', token() );
		
		xhr.open( 'POST', pkg.url, true );
		xhr.send( frm );
	};
	
	hearall( pkg.observe );
	listen( window, 'beforeunload', ( e ) => {
		e.returnValue = '';
		send();
		return true;
	}, true );
})();
