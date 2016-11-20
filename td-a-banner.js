/**
 * @ngdoc directive
 * @author daniel.cho@td.com/danielcho80@gmail.com
 * @name tduiteam.directive:tdABanner
 * @example
 * <pre>
 *	<section td-a-banner options='{"parallax_top":105,"parallax_top_m":105,"bg_srcset":{"lg":"images/a-banners/a-banner-01-dt.jpg", "md":"images/a-banners/a-banner-01-tl.jpg", "sm":"images/a-banners/a-banner-01-tp.jpg","xs":"images/a-banners/a-banner-01-mobile.jpg"}}'>
 * </pre>
 */

angular.module('tduiteam').directive('tdABanner',['$timeout','$window', function (timer) {

  'use strict';

  return {
	restrict: 'A',
    link: function (scope, el, attributes) {
		
		var $banner = angular.element(el),
			BREAKPOINT_XS = 'xs',
			BREAKPOINT_SM = 'sm',
			BREAKPOINT_MD =  'md',
			BREAKPOINT_LG = 'lg',			
			BREAKPOINT_XS_VALUE =  0, // xs value is the lowest, since we're using min-width we want to use 0, this includes all widths up to sm
			BREAKPOINT_SM_VALUE =  768,
			BREAKPOINT_MD_VALUE =  1024,
			BREAKPOINT_LG_VALUE =  1200,	
			bpArray = [BREAKPOINT_XS,BREAKPOINT_SM,BREAKPOINT_MD,BREAKPOINT_LG],		
			mobile =  (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase())),
			chkImgLoad = [[]],
			bpnum=0;			
			
		var fn = {
			
			ID_NAME: 'aBanner',  // id for this component	
			parallax_status: true,//false,
			parallax_speed: 5,
			parallax_top_pos: 105,//62,
			parallax_top_m_pos: 105,//47,		
			callout_class: 'td-a-banner-callout',
			callout_min_height: false,
			callout_min_height_sizes:{
				lg: 156,
				md: 156,
				sm: 131,
				xs: 0
			},			
			options: scope.$eval(attributes.options),
			
			img_info: new Array(4),			
			banner_width: 0,
			banner_height: 0,
				
			init: function(){
				// assign unique id
				this.uid = this.ID_NAME + Math.floor((Math.random() * 1000) + 1); // unique index for each a-banner instance,	
				el.attr('id', this.uid);
				this.setup();
				
				fn.set_bg_image(this.parallax_status);
				if(this.parallax_status && !mobile ) fn.checkImages();
				
				if(fn.callout_min_height && (fn.uid !== 'undefined' || fn.uid != '')) timer(fn.set_callout_min_height, 300);
				
				timer(fn.addEvents, 300);

			},
			setup: function(){
				fn.bg_srcset = this.options.bg_srcset;
		
				if(typeof this.options.parallax !== 'undefined') this.parallax_status = this.options.parallax;
				if(typeof this.options.parallax_speed !== 'undefined') this.parallax_speed = this.options.parallax_speed;
				if(typeof this.options.parallax_top !== 'undefined') this.parallax_top_pos = this.options.parallax_top;
				if(typeof this.options.parallax_top_m !== 'undefined') this.parallax_top_m_pos = this.options.parallax_top_m;
				
				if(typeof this.options.callout_min_height !== 'undefined') this.callout_min_height = this.options.callout_min_height;
				
				if(this.callout_min_height){		
					if(typeof this.options.callout_min_height_sizes !== 'undefined'){
						if(typeof this.options.callout_min_height_sizes.lg !== 'undefined') this.callout_min_height_sizes.lg = this.options.callout_min_height_sizes.lg;
						if(typeof this.options.callout_min_height_sizes.md !== 'undefined') this.callout_min_height_sizes.md = this.options.callout_min_height_sizes.md;
						if(typeof this.options.callout_min_height_sizes.sm !== 'undefined') this.callout_min_height_sizes.sm = this.options.callout_min_height_sizes.sm;
						if(typeof this.options.callout_min_height_sizes.xs !== 'undefined') this.callout_min_height_sizes.xs = this.options.callout_min_height_sizes.xs;
					}
				}		
			},
			
			addEvents: function(){
				
				if(fn.parallax_status && !mobile ){
					angular.element(window).bind('scroll',function() {
						var top_pos;
						(fn.getCurBreakPoint(window.innerWidth) == 'xs') ? top_pos = fn.parallax_top_m_pos : top_pos = fn.parallax_top_pos;
						var yPos = -((window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) / fn.parallax_speed) + top_pos;
						//var yPos = -($window.scrollTop() / parallax_speed) + top_pos;

						// Put together our final background position
						var bpx = $banner.css('backgroundPosition').split(' ')[0];
						var coords = bpx+' '+ yPos + 'px';

						// Move the background
						$banner.css({ backgroundPosition: coords });
					});


					angular.element(window).bind('resize',function(){
						fn.banner_width = document.getElementById(fn.uid).offsetWidth; // $banner.outerWidth();
						fn.banner_height = document.getElementById(fn.uid).offsetHeight; // $banner.outerHeight();
						var cur_breakPoint = fn.getCurBreakPoint(window.innerWidth);
						//var img_ratio = img_info[cur_breakPoint][0];
						var chkExist = false;

						for(var i=0;i <= chkImgLoad.length-1;i++){
							if(chkImgLoad[i][0] == cur_breakPoint){
								chkExist = true;
							}
						}

						if(!chkExist){
							var actualImage = new Image();
							actualImage.src = fn.img_info[cur_breakPoint][0];

							// intially set the bg size to 0 so that the image doesn't show until it's fully loaded (this prevents seeing a distorted image before it's fully loaded)
							$banner.css({ 'backgroundSize':0 });

							actualImage.onload = function() {
								var img_ratio = fn.getImageRatio(this.width,this.height);
								chkImgLoad[bpnum] = new Array(2);
								chkImgLoad[bpnum][0] = cur_breakPoint;
								chkImgLoad[bpnum][1] = img_ratio;
								bpnum++;

								fn.getBgImageSize(cur_breakPoint,img_ratio,fn.banner_width,fn.banner_height);
							}
						}else{
							for(var y=0;y <= chkImgLoad.length-1;y++){
								if(chkImgLoad[y][0] == cur_breakPoint){
									fn.getBgImageSize(cur_breakPoint,chkImgLoad[y][1],fn.banner_width,fn.banner_height);
								}
							}
						}
					});

				}	
				
				angular.element(window).bind('resize',function(){
					if(fn.callout_min_height && (fn.uid !== 'undefined' || fn.uid != '')) timer(fn.set_callout_min_height, 300);
				});				
			},
			set_callout_min_height: function(){
				//var cur_callout_height = document.getElementById(fn.uid).getElementsByClassName(fn.callout_class)[0].offsetHeight;

				if (window.innerWidth >= BREAKPOINT_LG_VALUE) { // LG
					fn.get_callout_min_height(fn.callout_min_height_sizes.lg);
				}else if (window.innerWidth >= BREAKPOINT_MD_VALUE) { // MD
					fn.get_callout_min_height(fn.callout_min_height_sizes.md);
				}else if (window.innerWidth >= BREAKPOINT_SM_VALUE) { // SM
					fn.get_callout_min_height(fn.callout_min_height_sizes.sm);					
				}else{ // XS
					fn.get_callout_min_height(fn.callout_min_height_sizes.xs);
				}
				
			},
			get_callout_min_height: function(min_h){
				var obj = document.getElementById(fn.uid).getElementsByClassName(fn.callout_class)[0],
					obj_child = document.getElementById(fn.uid).querySelector("."+fn.callout_class+' > div');
					
				// reset
				obj.style.minHeight = '0';
				obj.style.height = 'auto';
				obj_child.classList.remove("callout_center");
				
				if(min_h != 0){
					// set min-height
					obj.style.minHeight = min_h+'px';
					
					//console.log("c_callout_h: "+c_callout_h+"::::min_h"+min_h);
					
					// set height to make content within callout center
					var cur_callout_height = obj.offsetHeight;
					if (cur_callout_height <= min_h){ 
						obj.style.height = cur_callout_height+'px'; 
						obj_child.classList.add("callout_center");
					}
				}
			},			
			checkImages: function(){
				
				fn.banner_width = document.getElementById(this.uid).offsetWidth; // $banner.outerWidth();
				fn.banner_height = document.getElementById(this.uid).offsetHeight; // $banner.outerHeight();

				var actualImage = new Image();
				actualImage.src = this.getBgImage(window.innerWidth);

				actualImage.onload = function() {
					var cur_breakPoint = fn.getCurBreakPoint(window.innerWidth);
					var aspectRatio = fn.getImageRatio(this.width,this.height);

					chkImgLoad[bpnum] = new Array(2);
					chkImgLoad[bpnum][0] = cur_breakPoint;
					chkImgLoad[bpnum][1] = aspectRatio;
					bpnum++;

					fn.getBgImageSize(cur_breakPoint, aspectRatio,fn.banner_width,fn.banner_height);
				}
			},			
			getCurBreakPoint: function(w){
				if(typeof w === 'number'){
					if (w >= BREAKPOINT_LG_VALUE) {
						return this.pullBgImage(BREAKPOINT_LG);
					}else if (w >= BREAKPOINT_MD_VALUE) {
						return this.pullBgImage(BREAKPOINT_MD);
					}else if (w >= BREAKPOINT_SM_VALUE) {
						return this.pullBgImage(BREAKPOINT_SM);
					}else{
						return this.pullBgImage(BREAKPOINT_XS);
					}
				}else{
					return false;
				}
			},			
			getBgImage: function(w){
				var getImgUrl;
				if(typeof w === 'number'){
					if (w >= BREAKPOINT_LG_VALUE) {
						getImgUrl = this.pullBgImage(BREAKPOINT_LG,true);//bg_srcset[BREAKPOINT_LG];
					}else if (w >= BREAKPOINT_MD_VALUE) {
						getImgUrl = this.pullBgImage(BREAKPOINT_MD,true);
					}else if (w >= BREAKPOINT_SM_VALUE) {
						getImgUrl = this.pullBgImage(BREAKPOINT_SM,true);
					}else {
						getImgUrl = this.pullBgImage(BREAKPOINT_XS,true);
					}
				}
				return getImgUrl;
			},			
			pullBgImage: function (b,s){
				var bArry = [];
				var result = '';
				if(typeof s === 'undefined') s = false;
				if(typeof b === 'string' && typeof s === "boolean"){

					bArry = this.getBreakPointSeq(b);

					for(var x=0;x <= bArry.length -1; x++){
						if(typeof fn.bg_srcset[bArry[x]] === 'string'){
							(s == true) ? result = fn.bg_srcset[bArry[x]] : result = bArry[x];
							break;
						}
					}
				}
				//console.log("============>:"+result);
				return result;
			},	
			getBreakPointSeq: function (b){
				var gArry = [];
				if(typeof b === "string"){
					switch(b){
						case 'lg':
							gArry = [BREAKPOINT_LG,BREAKPOINT_MD,BREAKPOINT_SM,BREAKPOINT_XS];
							break;
						case 'md':
							gArry = [BREAKPOINT_MD,BREAKPOINT_LG,BREAKPOINT_SM,BREAKPOINT_XS];
							break;
						case 'sm':
							gArry = [BREAKPOINT_SM,BREAKPOINT_MD,BREAKPOINT_LG,BREAKPOINT_XS];
							break;
						case 'xs':
							gArry = [BREAKPOINT_XS,BREAKPOINT_SM,BREAKPOINT_MD,BREAKPOINT_LG];
							break;
						default:
							gArry = [BREAKPOINT_LG,BREAKPOINT_MD,BREAKPOINT_SM,BREAKPOINT_XS];
					}
				}
				return gArry;
			},	
			getBgImageSize: function (b,r,w,h){				
				var coords,
					top_pos,
					g_size = w+'px ' + (w / r)+'px',
					img_minHeight = h;// + document.getElementById(this.uid).offsetTop; //$banner.offset().top;
					
				if(img_minHeight > (w / r)) {
					g_size = (img_minHeight*r)+'px ' + img_minHeight+'px';
				}

				(b == 'xs') ? top_pos = this.parallax_top_m_pos : top_pos = this.parallax_top_pos;
				coords = '50% '+ top_pos +'px';

				$banner.css({ 'backgroundSize': g_size,'backgroundPosition':coords});
			},			
			getImageRatio: function (w,h){
				return w / h;
			},			
			getImageInfo: function(breakpoint, img_url){
				fn.img_info[breakpoint] = new Array(2);
				fn.img_info[breakpoint][0] = img_url
				fn.img_info[breakpoint][1] = this.getBreakPointSeq(breakpoint);
			},			
			getBreakPoint: function(b){
				var breakpoint;
				switch(b){
					case BREAKPOINT_XS:  breakpoint=BREAKPOINT_XS_VALUE; break;
					case BREAKPOINT_SM:  breakpoint=BREAKPOINT_SM_VALUE; break;
					case BREAKPOINT_MD:  breakpoint=BREAKPOINT_MD_VALUE; break;
					case BREAKPOINT_LG:  breakpoint=BREAKPOINT_LG_VALUE; break;
				}

				return breakpoint;
			},			
			set_bg_image: function(ps){
				
				var bg_srcset = fn.bg_srcset;
				var style_string = "";

				// get breakpoint and url data, push into another array so it can be sorted
				var bg_srcset_array = [];
				for (var breakpoint in bg_srcset){
					var img_url = bg_srcset[breakpoint];
					
					//console.log(img_url);

					if(ps && !mobile ) {
						//getActualImageInfo(breakpoint, img_url);
						this.getImageInfo(breakpoint, img_url);

						if(bpArray.indexOf(breakpoint) != -1){
							bpArray.splice(bpArray.indexOf(breakpoint),1);
						}
					}

					// convert known breakpoint labels into numerical value, otherwise keep numerical value
					breakpoint = this.getBreakPoint(breakpoint);
					bg_srcset_array.push([breakpoint, img_url]);
				}				
				
				if(ps && !mobile ) {
					for(var y=0; y <= bpArray.length - 1;y++){
						var g_bp = bpArray[y];
						var img_url = this.pullBgImage(g_bp,true);

						bg_srcset_array.push([this.getBreakPoint(g_bp), img_url]);
						//console.log(bpArray[y]);
					}
				}				
				
				bg_srcset_array.sort(function(a,b) { return a[0] - b[0] } );    // sort array so lowest breakpoint comes first

				// add a style for each breakpoint and include the corresponding background image url
				for (var i=0; i<bg_srcset_array.length; i++){
					var breakpoint = bg_srcset_array[i][0];
					var img_url = bg_srcset_array[i][1];

					//console.log(ps +'::::'+ mobile);
					if(ps && !mobile ){
						// in the css below, we intially set the bg size to 0 so that the image doesn't show until it's fully loaded (this prevents seeing a distorted image before it's fully loaded)
						style_string += "@media(min-width:" + breakpoint +"px) { " +
							"#"+ this.uid +
							" {background-image: url('" + img_url + "');background-position:50% 0px; background-repeat: no-repeat;background-attachment: fixed;width: 100%;position: relative; background-size:0; } " +
							"} ";
					}else{						
						style_string += "@media(min-width:" + breakpoint +"px) { " +
							"#"+ this.uid +
							" {background-image: url('" + img_url + "');} " +
							"} ";
					}
				}
				
				// add css style to head
				var head = document.head || document.getElementsByTagName('head')[0],
					style = document.createElement('style');

				if (style.styleSheet){
					style.styleSheet.cssText = style_string;
				} else {
					style.appendChild(document.createTextNode(style_string));
				}	
				head.appendChild(style);	
				
			}
			
		};

		fn.init();

    }

  };
}]);