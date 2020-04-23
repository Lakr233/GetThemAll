(function(){
	
	if(window.__fvdSingleDownloaderContentScriptInserted)	return;
	window.__fvdSingleDownloaderContentScriptInserted = true;

	const BUTTON_TITLE = "Download";
	const BUTTON_TOOLTIP = "Download";
	const ADDON_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACg0lEQVQ4jY2RW0iTYRzGn2/v+73fYYdv7jxtbnNmiXO5TheKQZCSIEJEXUrQZQXSlUJFRHgRXQUVRPeBBGInyouMgihBQUsNa6Lo5mEz3dS5fW77uvCiPNLv+nng+f3/HHbjZEeFUeKrVhJ5HWEExKXnsJocVz8lxoAnG/9G6S51ndPEt7uCjtZMMpknJj0ExnSzg5meudBaG4YxsyW8o17SUUQpV1mYihKppJgJTM+0yQSVbEoIcPi3x3cusKh2csDt1HJpcOPTgI5A85ZCUJkJkZgTAAdA23MBFfQeSV23aQ478kVWFNzF0BkU6NMZxSQZPUAT21eBMepnKjWwLAC3C5zFBjFbgMh4kfJ8Kco84r4KPBMqjALlCkRETlRACA8hnQIvcRBk2QeqMwBI7q1gtwaIzw9Z1UHijZA1EbLGgGA1qMvlQWxF2b6Ag69Nkf3OQDqV9ZDVVChbcgKCTYM5lgATGXLhINLZPLREyqcPVzWvsXtWzKV/YmQkTgAA7sb6spbTL8qb687lp5Zd+ehvrqiuBlazBL3XiQLhoH7oh/2wTy6/1FgncNKFhYnIR8QeRzYVUpODE6++vEOWKtVXznMOiwHC5wGYy1wwGXmIA8MoDXoRvlgL9Vdc/vH2ay+W0kMAtM0FK0Prhaj5zfx0XPQGA7VHm46Ai8VBZ2ZBFxZh8TsROBvCUN8oXj/sfpTvT1zD0v1lACB/zzGaK8y+742OOzOBmtL6Y2eqqTqdgOJQcKihEv293za6HjzvzA1+bweeZrcffwtiuPPy9ZeRVNd8Qete1LSrz8bWhZo7bbt9bU/k8o6W230z8Rs9E0skfLP1v4tbOHj3FD1+q2G/yB+MJNSfSgtbTQAAAABJRU5ErkJggg==";

	const EXT_IMAGES = {
		"flv":  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhtJREFUeNqMU79rFEEU/mZn9tddTrIrmuAP8Ad4YhPE3kpCChux0Jg0/gUWEZSoGAQ7wTTamFhpLWilvQpWBsTkgnf+gKQQ9RJQL7u37vPN7O1ejjvEB293Z+d933zzzRtBRNCxunvvlzRJ9iNNMTgELEt8rja/Hsj/aKzICVbCETp6fx6GwLK6OD3+wykEljZ/wr8y+7j6qzmdE5iHzuXhXUSLD2m5HFItGClSj2lhgd5BkY63d+apVg4e5QSqR2U7hj00BMt1ugLi2CgQysEGj8dmLmHJ96Zq129qmRes7XtEK4J0XUjHKVL5Pr4/eYrwxHGsCwfvpYexrRZSokmNsrbjEUcZ0O6ksiGFRJstCBcf4BjFqOzZByTtrL6HQMdWTmBnyWaWJsYx+vwZ5PAObN64Bel5pi6Prgfssp5QTCCU0g6BohjhvbtI6h/x7eQpWDtDKPbIEAgxQEGkFbiZfEuiPHkuW+XwQYyu1bMt8byu61egN8XmKC4QzE5RG975s6C1dfyeuw3BZtp+CaR7hOtyE1SPiVqBrSD46NTFacjqEbRm50CrH7hSQfoeTN9pBaJPAbJjZNftq5ehTk8grTcgXr2BKpWLPZvuG2hi7kEQGDA1PiGZuQZZqfS2dqdu8Cnw+TpuCTgzZXxwXJ/Bou9SobVRKCoIfgAvVl6+Hkfncv0zGKzrzWd+G3nFQ/wK8P/RZGzjrwADADmH0oUUM6YwAAAAAElFTkSuQmCC",    
		"mp4":  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC8UlEQVR4nH3SX2ibVRjH8e95T94kK1lTF5Jqu/WPxq3iOlY35zY3LwSxN0M2qVNvBRmICLv3RkEUvFBBr71q2cCB0CsdLRuzy9pNa7J2HXHSbItNljZNmr9vzvue40VptDL8XT0XPz485/AI/icff/p5aDC+70i10TpsSXly+sfx9364dOnRvztia7iRSHzw/P797wghap7nOZ42Qw72s8WKQ8NRFMsbqHz6wvp68ebk5OT4xMTEXwC+78cv7hsaOfm+7VXflpbV83sySTKVolBYAwzCssAY+nb3EI11nz19+szZ2dnZW8AmsHg7tXdH34nz8UgQKS0WFhYprfzJ+TePoVwPAL8d4KNvJhl9/TVSqSS9vb3hrc19c4lfpl4d+xBwQQiqtSq5XJ7rMwk8bTBAIOBnvVQiEAgwMDDA/Px8VxuYnpqqnVt9mHyyL3rAGKjX6zzK55n7NYc2myW/30+tqlFKEQ6HiUQi/wAAG6sPfqY/egBjaNTr1Bywu4fxtAbAsiQbv82glMKyLMLhcOcWYAGkUzd/8kkJQNNxCNqCFwZiHNwT42B/jBfjPVSqVZRSSClpNpuBbcD1a1enOwJCe9rj2NHjjLx0nJyyWTNB1nSQXMtmbOwt9vT1o7VHJBptf2L7Dq5cvXJtZOTQyxpB3WmhPQ3C2nyntPD5JJYw+CxJrlBc2ju4+7n2BgDNhnNfC0lTGeqOS7XlUnNcGspQV4Z6S+O4AldDvqyGPvvyq13bANv2tZSnaWlBJlempSX3V2vkyw0yhQoukuxqGWUExY0Kw4eOjm4DXKU8zwg8BJdvpZlZfEBiucTtbIUbd3MsZQp8d+EyRkg6d4ZoOu4r2wHPdQ2CuYV7PBV7guy6Q6wrhCskR4bj1JVHJNxJqeawci/57djoiXPtOwC4s3gnY3eEM907o/27OmxCHUHSf6QzrquL2eqy8UlhHX46ZC0vJQMrD7N3eVwGn4nv+OSLry+eeuPMu12RSPSxpf/kbyr9W3ISlXDzAAAAAElFTkSuQmCC",
		"mp3":  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA5dJREFUeNpsk21oW2UUx//3JffevN50SZYsrm1SyyptVkrbLXZTit2ouslwijKduIF+EYcKDhTFF3AyXxC/DffJLypjICjaKa3spTDLunYd2Tpns4Ssmc3SvN/kJrm5L48384uIB35fDuf/5zznPIfC/4TFwrAul9jBWWiK3jDc6nvs+EaaUsM0y/RRDPNAo6VvvXxp+f1GvXmO/bcwMhAZ3rP/8Mvbh6MP+73u4InpHLWSg1rVKdGgeV5tEkhNHbliDY3yXQ80GfcMKJMXj77x7uhzb77nkn18gDPAkBJWqgpIQESL0lFRgVydQKYIwBtmm5oOQ/nH4NBrh97a9dnhY4kMQelWEVxZgI8lcHe6sFRkoOsWiFYGw90W9PtpxP5oYi5GdIABu6W3d8tLHz/9YbxxE06LE1KoB/FbLOolDq1yBm+PODAx0o1eHwfRxtx76vGfDVw9dcPTWFsE/eS+iQMR1hBGKRUDzgJ84hJKnX8i1lw3uFbN2NnV0vxWmThNcbmloSDXUZIVHHhm4qhIknY2MjQwYqm74KsYECkZQb4MD8kTEh5Lz19WuIUrsRmrwO9YTed63C47baN1VIsSHhyN9ld2PbqPtgtuB4sgaGyGpRmCZ/1+RLJBErK6lGyxUnj9lVePZNfuzOnlhMznFyFqSRBFgsDKeGQ8Osmm0oW/6oYPksZBIQbU9lg9FC3XjE0ddqH16efHvrS53aF5aYnZGlCgKE7UWiEoTQOBgHUzfe7C7HSd5aEKNhC7A26/F93hLggO0UmxFo/PO/jC1+fz0V/kbttMfhzfZh/HxTUvmm4JJa0ss2d/m/7p2tWl5LaxsR6aEGQlDT9cr+JSXEVOMddEU3xICCF+TcPC3S7krU6kNBYJsQBp5vbvjGpGKpGQDh58/okOK0e/810aP6ZdWCyLIFIJ+yMsbDoHWeExFZeRAQHrrqLPsV46/8mJI+3FutKrt2upRNK+e3JyKF1kcWqhgoZew5BXw+B9NvAqBadDQDDIgLdU8dA2GpmTX3x0ZW5+qm3QHptzefl6dXZ21nhqd3/ns9FNwnavjh1hHm7zB1rNAlpjENjoQ8BRVFdOfvDN9OnvvzLTlfYZ0Ca8ic8kJPDc4J69e3eOT0wO+jvDQcHmsBmybtxZzZZjNxZunv319FQylTpj1qZMGtR/LrndkWBiN9kg8LzXarM6DMOALFfLmkYyZj7fFpoYbcHfAgwA8IWCw4Q+/vsAAAAASUVORK5CYII=",
		"pdf":  "data:image/png;base64,R0lGODlhEAAQANUAAOR8gd3Q0uCsr+lARuKUmN+4u/JVW3t8fJ2DhPDw8N7ExuVwdbEVG+FES9s+RDc3N1NGR4UPFOsoLzsHCc8YH+dYXqeNj3YOElgKDXI+QG9iY+OIjOZkaehMUqWlpm5ub+0cJMDAwNzd3v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACMALAAAAAAQABAAQAZ9wNEoESoaj8JkyCNqigjO5icEqlqvHedUuBQFOACnYtPRUK/ojodBQSS4TKcgKtqOuk1AoaPQhrgWA1l0Un93Bx6Jih4HEQhCaGkeGBcTIQYGDQ4dnB2CC35wUXNRdnheHQGlhngBFQAcAyADHKYeBB2ghKYQGR+/wMAPIUEAOw==",
		"webm": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnBJREFUeNqkk8trE1EUxr+5M8lMYhtT66sFK5ZWfEAXIv4BBcXqVsGVC1F04UrEx8bHSqTLghUfCEVcCRV15aIrKYW0sbW2SmrbVPNqnpNJZpKZZGY8Ny2lqLULL/ODO+ee+91zzzlXcF0X/zOkaZxrTEjnlFaw+n1bpNeKLD52XDcJAfxDxbAhMMCnSGBk6b/5CVOjWcg+kf6x4uQ4blc6ZhxaipTupOLGhGXaD8h5r9BY3XiwdfM6EwXYtot8utq29L18a1XoIWNCpyBsLtAY3JELOStCrYsR7UZuuRK26+4ALe1nv0XENgptTcgBinlra2yxfDWVMMbNmj1Ia22bCqwXkrwMdA3Eo3rzu1fRK7EFvYfbGlX4Z4IoAtqHslbH/ExRmw0XhuhaA2W1FpFoTSCkjTbyspXyNSx81XLfJtXn8cXyMyr2nL/JA4/MYNdcqFkTkgIRNqiZRJeJ0krhS2oNc9PFzEwo/yK3XH1E11hyKReyXwR3LeYsJKI6MqkqpPBEFu0dflimYxYyFiJTajLyRX2y/NN4auj1uCyL8NB9A9s8SCcqiEyq0OiAtRw1B704cWYPAi3eHdlU5XQmaXyoGk6iWDARm9d5hyIQ9GB4tg/3L4Uw8ib+94QpfgmtuxU0k/Nq0/iJy41Jk4SQeRbH6aA/3gJxnuetatQLRIBrEUeIj8RF4ujOdt97hbGxjq6mNInfo6g6yG4QJi9mH3GNuEv0Ehd4WxMniSQx3N0TvK7rtbFjvbtu0wM6TLYfqxF2Ulqxj8gTFvGS4DYeyTjRTRxo2S6PehVp8O1QdGRhVjtIEXwme4kf9EuAAQCi5QsEyi5VUgAAAABJRU5ErkJggg==",
		"swf":  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwBQTFRF0NDQwQMDvgMD09PT0AEB6urq2QEB39/f+fn5wTc39PT0t7e30tLSPz8/sbGx2gEB48HB7Ozs29vb6+vriIiI+Pj4ra2t4uLiuwEB1NTUgQEByEZGr6+vmJiY2AEBxwEB6wEBvg8PvzY2Hh4euxAQxzc3xEdH3Nzc6enpoqKi8/Pz6cbGwMDAZgEB+QEBwTg42NjY4+Pj37Cw1QEBhAEBtAEBx0ND8wEBq6urqqqqvLy8rq6uwwEB5ubmvr6+o6OjoAEB5eXl8PDw4LCwylRU47Oz7+/vyAEBxERE/AEBlJSU9vb23wEB3gEBx8fHvgEB58XFk5OTv7+/1wEB6Ojo4eHh9fX1tra2ww4Og4OD3Le3qgEBvb294gEBlwEB0gEB7u7upKSk3rm5swEBwcHB9/f3+/v7/Pz8+vr6YwEBJSUl/f39rKys/v7+////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg1O7SAAAAHB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ALdhYtIAAADdSURBVHjaYsjPz5fkE8sRy8nJkQkFchiA2C4jTMtJ0FaH3VoIKBDs68PGIu9vGu1gn8ZuKZTPEK/naa4Qy8ZiExeZlsae48iQLMfPz2bM4i5hIisi4qXJwyCVCQW64iGGfoFWDOrMzInMDEBgEGXGmMATzuAmLMwtyMrKqpEUwejBxcUHsjYlIxUIVBmNvFNFc8AC2Wkcos6MipwCGRxQgfT0NBcmTiWBjAy4gCuTfhpHKkJAmkklAKgsOxsqkMukpp0LBHl5YIGg7FwoyMuzAAnE8GZBgTIvN0CAAQCCX0cVtLCG1QAAAABJRU5ErkJggg==",
		"3gp":  "data:image/png;base64,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",		
	    "set":  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAIeSURBVHjalJO/axNxGMY/33i5/GjSxIYkGFtL8T9wcnToKjrZLmZwcRCKIDp1EFxUEKRYRJDQSYtDLEgFt0gEiyIqFqQgwVJpm6SXJpdL7q65u69DtG0aWvHZXnjfh/d9n+eBI/CisCyfLn6UR/X49hf54op8XljeHTBsp6d5Nl+UM/OFHkLlIKNpO+SLKxJgMBKg4x1jdmFJupaFu+P2bdBHEA+HGB1OAuA6Hju2wdhwCsNoo7fMPgIBkHvzRYYCCslYhFRiiIpWY/XXOpvbbQDSiRghReAPBNFbJmWtQa2q8eDGhFAATiWj6C2H4/FBKlqNdx++cvvqBdFz/8KSHIkIGAhRaxiMnkzvPXH8zGnhyO5v3n/+1jcMcO3iWbFWbdKxLTqOy9TkOQGgzL0synAiifKHwKpsHSqZbVkQigBwJ7coY5EwvqBR321omzbCrx5K4Hh7ChqGTennGsrk5fMCIP/2u2y2TeKZDP+C1Gvcm7okeo3k82FaJieGBsnNvepz3/1nBRkNB3E9j6an9Mr45PUn6XQcxjJpTLuF1bKwNzZw/SqKbVH2BVCDAWIDKlrTRtvaRtfrPJ6+0pXxR2m16yq/QjwcRFVVxHD3FKfjkAHqjTZa0yaogOeDSDy+t8F+zMwXpF+AdiAHjtmi3mjw8FZWHBqmvwEqVWtMZ8dFQ9cxdJ3p7LgYSUVZ3yzzX7j5KC8nrt89Ms6/BwCDq+0MBWPO0AAAAABJRU5ErkJggg==",
		"like": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAMAAADarb8dAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE4OTE0Njk0NjJEMzExRTI4MzJBQzI0QzdFNzBENjI4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjE4OTE0Njk1NjJEMzExRTI4MzJBQzI0QzdFNzBENjI4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTg5MTQ2OTI2MkQzMTFFMjgzMkFDMjRDN0U3MEQ2MjgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTg5MTQ2OTM2MkQzMTFFMjgzMkFDMjRDN0U3MEQ2MjgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5J5mcSAAACE1BMVEX+/v3/8LPewHf58Nvn2cP/9Mn27t/rzojo2cT/6YTw2qPy15L/22H/3nW+jjzrzYb/1V//1l/q39HGkzXClEfx15H73ofw2aP07N7Io3D68dz48uX+9+HjuVb+/f3myIby0Hbvxl3/3FT/9cn++On++erw2aLszon48ub+9+D++OXhw4383ofZqUn84ov/7pT9+/r944vkulj+64bjxYTkxob/44D/3nTVqUzXwqTXqknrzYfHom/003X69/P/9s7HpHD734jGlDa7hzazilLFoGzTp0vZqk3Oqm/Yw6by2qb/7rH/3VX7+fbuyF7GkjPUvZr37+GwhUb844vp28b74YnRrWm9jD3sxF2pfUDHlTmofUDku1fRrWrjw4CwhkXXwaTHlTjz0HPy0HP734f07N/yz3T/2m3iuVfz0XapfELMnEC7ijm4jk7s4tXrzof/3nD/7rPmyYe0iEPgzbLwzXTgvGbp28Xiz7X/33Xiw4D68t368t770FDSsnzFoWuqfUDLp2y/jzy4jEzGkzmofULGkzby3Kjz0nTkulfiz7Tx15D/9cr/9cvMnEH+7JT/5IH7z1DEn2r/9s3fzLHwyGX/9cyrfkDhxYzy1pC0hkXClUbsxFz68d3/3m7+/fzGlTbOqnC2jVP9/Prxy2XivmjYqkvy2JT38OP/+eTixYO8ijvkxoX96oT/2W3kvFr///98qdT8AAAAsXRSTlP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wDX9FxkAAAA9klEQVR42mLYsGH5nJkbwEA0gnvDBgYp9fWaGfzVGzbUWMfIdLIzM5iqKRf2tssbLC7ymubNKh7HsGKBHq+jv0RQfKqwIa9OCxsDw+oOq8w6SyYmT2dbXQWPDQwbWCaVLGpt7tfPzXKZYsMBFNiwIaFsLecEM07jpQFADkjAt2FqQfq6eUum20EFVPNm8QgI8hQLqUAEuP1MZivVTvQRWaXYDRSYm2+k5dbUFx2ZzWexUhbosDVcPYz2M2Ll5odpT2Zk5apiCEwMNU9xkt6wQaMtuFIsCuiw8ORlaY0g03KS3EsXghxWXyEZAvIsh2uXQ/kGgAADAAD4XjTtv1M+AAAAAElFTkSuQmCC",
		"bet":  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADL0lEQVQ4jW2TS2gcdQDGf/+ZnflvNvtIaJ5skm6bbcl2CVtiDRRsKmgiJODZ1oMX6aFEjOBBEE9KL+qppxJyMqBgC4pE0RZSH9GSdAiSlJA222w3G9JkQx7dzcxmZmf/HkSoxu/2wfc4fHyCoxCxUNMLtl274KH6wQe8Oaj+Cp4F1P4lfp4ku7rOOGX1USQlXrswUG3s73aoVX2Wf9e5fVfsLjx1buM6HwOLR2p7U70DpxM9uVPXz6qrpTPqgTqmlBJKKZRa0FXx3aj6pLtNxepjTwgEXv7HpwGc7zufJCgmd95rOh46EcYIewB4roF7CAR0mo4F+DAa4JoIdwWDwS+Q8jSADujdLR2f5i7rF7evhHjl2x7C9jOWfjD56kaS7386QX6jiZO6QWgzRPNDm6ca0QVDRXG97/SRV0d6dsKVa9kxWa/qDxmsP0evdZFvbhWQoS5QbTwqdvJEi5Nay6PlnmH6Gr9JFfcMYyoga9q5vYxqUZ0BEIpH21k+eP1tNqtFisVNYrEYdXUh7vz5AD23z/uaRqKmOOWL5vtB+aKmBfS+qlQENxThtSDO3R1KhyUuvfkGzc0ttLa2sfr4MYtzfzCrS7LSYNvQMBGYht4f0BtlpfUXSFiKYDBAnSZYWltmpHeEvr4+xsfHmZ+fJyQEK1JyudOgUqmwd+AT0Y2KZhjGfd3XlHAUwZpBJBohn88DkE6nyWazVKtVTNMEFI4G5VqVmhCYpnlPC4VCc+FoOF9yyrg1j62tLW5+fZOVlRXi8Tijo6N4nofv+38PX/VxnQpBKdeklLO6ZVn7AwMDrUtLSy8Vi0X29/dZX18nlUqRyWRIJpNYlsXq6iq6rlMqlfA8j3g8fmNxcfGWBmCa5ueZTOZeuVzGcRwApqenAYhEIgwNDeE4Dnt7exwcHJBIJGaFEJ8BSgewLMseHh7+ubGx8WyhUDheKpUoFApIKdnd3WViYoLl5WWklKTT6ZmGhoa3ZmZm1o6caWxsrMG27Xey2eylXC530rZtaZomvu8fdnR0rLa3t3/puu71qamp3f9943NB7UqpQdd1Bz3PE0KIO47j/Dg5ObnxX+1fV61hKgscqj8AAAAASUVORK5CYII=",
		"fvd": 	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoZJREFUeNpsk0trE1EUx899zEyatk6xImotaLUgFXGnIijddS/FhVsxwb1fQFz5GfwIElwX68JFN6JQi0VbU/rQJmmbTmIm874Pz0zoZHwcuDB35v5/95z/OUMuPnsNJyGVOn9j6vTynctnphKp5Ml7Til0o9haWmu86IfJS0ZzCXApVb4JhaJzF+zJx/dnbT9K8vclg8HusQfv1xujThyDydgQAEDyDcVnL5LiR9cHP84TAMug0HRDkBoUIaQoAc4owdR1tkm/RZhRL5TgJwUAKvuRApWdIdlBgmVRRhCQFkQ0CKUyciQUOIGAqAAwOIVeJDOATvV4KTfYSQkAaRapWsrMB+iEAmJRAAgExAKU1kDxZm7wogdI1SkEUyIKTZa6F0gEiCEAs+wjVEodpmlnGhhYgR7Q51gXwRYmJZNPlEcsuxskkBS6w6iCSFGwx0oLwg1QQjgjdFxI+ZZj3J6+NL1gWhYorEFZBmx4KX/YqoHBDKZmZubPCjVP0ZN26zA8ODhc4b4fPNpvtl7N3rz+wBotQ5IkxS79ESZlMMIZNLZ2Oq3WURVLf8PRUafXdp7Uv3xV1+7dWixP2iAT8Y84bR/lHPbXN529b/WKkqpGEZYNJePc+dVqVzdWPtZEHIE1bgErGcBGBouXTTDHTGhubjnbn9aqGsXpHGRa++7DwRRSEgRdd7l35Fw5NWnPGei2iiLQ2A2CM/Jzve5sfVitKCFrFEvJhglXDhhAaBD0vXfu4fHVssnmCM699DxobG47O5+/V7VCMf4HBEgO4H/XyhhzXMet1Fc39PS5iUXXjzv7zU5Fq2HaxeD/c5sy6nh+/HR3ry1ipZawqTWSTav+5+xvAQYADRQ40Hwcd4cAAAAASUVORK5CYII=",
		"AD":	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAx5JREFUeNpsU0toVFcY/u553XPvPJLJazLV2IfJBEJCi5YsSlNsA7rRFmkXXXRVVwV3FlK66aZQ0C7soptQaDcVjCApljQLo3VRihSNFh/BTNI8sDM6yUycZCZz3/5XqZTogZ97Dvf83/f9/3d+I4oi7FxuiN65qt/r+f5LKR5i3ReNfKvYaNfsKv2u/v+usQOg7a+yNzZZqH9yvbid61dbxtFsA7edFJacJA7l0xdGe/QXdO/OcwAe0PHr/KMfbiyWPugyGshqAz2JCC0mh6kkZtc5Ts0CI32ZytejnR8qht+fARBE7tbiv5PLq8vDOTOEEgLgAkwocKUg6ZzWHIW1AMdnmhh5Pbv27bsdI4JhjhGIqFYq47X7C8Mxq6EsRFKDmxakaUJJCSkFXAgM9iTw3aEW/HK71nF2vv59SAIZKThQKhZHGbFIU8OkJG1ZsG0blhWfSQGBCCFhCo7yIx/upovJwtZ7W370tnAcZ0/TcSz5hElCkeQ40nbMzrBNzSGpMKWB89dr+HKKTGhLodwIUKz73cJ13WYQBOCcgzEGSysktMS1lW1MzdZw7J12BFTn+B81/Dxbh2qzkWlRIHZUnJAJSvLjRFAzTUWNi0KcnCpj/Oo2tpwQf656eOAwrAcc6e4UTFtAkTM8lkXmCZIbCmL3fQ+1jSq+utjEuUUTmVwKOUtgyYsgkxydVA4n70xyw0oItGqGtGR2DFDTWoflBxV2+rKHCytpZPemoZIKBjdgMoPsZBC0lwRiWQyMvrmU9HM2f2LjlWx3drpS3cA/m00kd7VDJch/uiSJUVscCZsjmRRIpQS0LeEzjsN7rJ/aNLsUAzitrZnPBgcHlz/atYxuLCGybLKPPw0qQyc1hQVDawReEx/vxsL7L+tvds7C/sLcnYkzk7+9Nh32o/Hqm9DUVElPSG6WIPw6dnMXR/oyE0eHBz6H0qsvGqaO9YelsYszMyemS4ax2PUGsmt3sb9xz+vL5xf2DQ2cfGVv748u+apoPl4E8N86XL6/kj13c2Wj8Pe12qcH33LyA0PzfhgUOX+aGL/QeD0WYABEziK94bE8yAAAAABJRU5ErkJggg==",
		"arrow_down":	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBFRTYyOUU3NDJCOTExRTM4MjJBQ0U4NDZDQUFDNDAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjBFRTYyOUU4NDJCOTExRTM4MjJBQ0U4NDZDQUFDNDAzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MEVFNjI5RTU0MkI5MTFFMzgyMkFDRTg0NkNBQUM0MDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MEVFNjI5RTY0MkI5MTFFMzgyMkFDRTg0NkNBQUM0MDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6N9LxFAAAAzUlEQVR42mL8//8/AyWAiYFCMPAGsMAYzs72YHrfvkMYipyc7EAUMxT/37v34G8MA4CAEah5JpBWRDfg0KGjbEBpoGv///vz5+8NoFA6XBIUC0gxsREkhIyZmJj+MzMzg2mo2AaYHrA+NANATlyHR/NaULjhMwDmrbVYNC+DBTpeA0ABZm1tJsHCwrIeSfMSqOsY0A1ghGlmZGSEhTYIsH7+/EXq9OlzXUD2PyCOA+LfyAZgxAKSZhD4zcvL8whIh+OIUkTUjeYFBoAAAwA5BYNkgcxwUgAAAABJRU5ErkJggg==",		
	};
	
	const RATE_MESSAGE_ID = "fvd-single-rate-message";

	
	// ======================  DOWNLOAD  ==============================================================
	function startDownload( media ){

		chrome.extension.sendRequest( 
			{
				command:"startDownload",
				media: media
			},	function(  ) { 		
		});
	
	}
	
	function downloadMediaItem( media ){
	
		var a = document.createElement("a");
		
		a.setAttribute( "download", media.downloadName );
		a.setAttribute( "href", media.url );			
		document.body.appendChild( a );

		var theEvent = document.createEvent("MouseEvent");
		
		theEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		
		a.dispatchEvent(theEvent);
				
		document.body.removeChild( a );
	}

	// ======================  DAILYMOTION  ==============================================================
	function buttonDailyMotion( mainMedia, port ){

		const BUTTON_ID_DM = "GetThemAll_dm_button";
					
		var clickTimer = null;
		var clickMenu = false;
		
		// ------------------------------------	
		function createButtonElementDM( buttonId ){

			var button = document.createElement("button");
			button.setAttribute("class", "tool_addto icn_right button action:toggleOrUpdate action:arg0:#moveto_container");
			button.setAttribute("data-tooltip",  BUTTON_TOOLTIP);					
			button.setAttribute("title",  BUTTON_TOOLTIP);					
			button.setAttribute("type", "button");
			button.setAttribute("style", "padding:5px; margin-top:20px");
			button.setAttribute("id", BUTTON_ID_DM);

			var div1 = document.createElement("div1");
			div1.setAttribute("style",  "margin-right:5px; float:left");					
			var img = document.createElement("img");
			img.setAttribute("src",  ADDON_IMAGE );					
			img.setAttribute("align",  "left");					
			div1.appendChild( img );
			button.appendChild( div1 );

			var div2 = document.createElement("div");
			div2.setAttribute("style",  "float:left; margin-top: -7px;");					
			div2.textContent = chrome.i18n.getMessage("button_download");
			button.appendChild( div2 );

			var div3 = document.createElement("div");
			div3.setAttribute("class",  "icn_wrap");					
			div3.setAttribute("style",  "float:left; border-left:1px solid; margin-left:5px; width:20px; padding-left:5px; height:14px");					
			var img1 = document.createElement("img");
			img1.setAttribute("src",  EXT_IMAGES["arrow_down"]);					
			img1.setAttribute("style",  "width:10px; margin:3px");					
			img1.setAttribute("align",  "left");					
			div3.appendChild( img1 );
			button.appendChild( div3 );
			
			button.addEventListener( "click", function( event ){
						
							var elem = document.getElementById('download_container');
							
							var x = elem.getAttribute("style");
							if( x.indexOf( "none" ) != -1 )
							{
								elem.setAttribute("style", "display: block; z-index: 30; position:relative;  margin-left:200px");
	
								chrome.extension.sendRequest({command:"getVideoData"  },	function( media ) { 		
								
																buildMediaListDM( media, elem );						
								
															}	);
															
								document.addEventListener("click",  click_document, true);
							}
							else 
							{
								elem.setAttribute("style", "display: none; z-index: 30; position:relative;  margin-left:200px");
								document.removeEventListener("click", click_document, true);
							}	
							
						}, false );
						
			return button;
						
		}
		
		// ------------------------------------	
		function click_document( media, parent ){
			var elem = document.getElementById('download_container');
			if (elem.style.display == 'none') return;
			if ( clickMenu )
			{
				clickMenu = false;
				return;
			}	

			clickMenu = false;
			clickTimer = setTimeout(function() {   
											elem.style.display = 'none';
										},  100 );
		}
					
		// ------------------------------------	
		function buildMediaListDM( media, parent ){

			var menus = document.getElementById('download_menu'); 
												
			var menu = null;
			if( menus )		{
				while( menus.firstChild )	{
					menus.removeChild( menus.firstChild );
				}
				menu = menus;
			}
			else   {
				menu = document.createElement( "div" );
				menu.setAttribute( "class", "dm_button_container" );
				menu.setAttribute( "style", "position: absolute; top: -1px; left: 0; border: 1px solid #ddd; -webkit-box-shadow: rgba(0,0,0,0.3) 0 0 1px; -moz-box-shadow: rgba(0,0,0,0.3) 0 0 1px; margin-right: 0; padding: 8px 0 4px;" );
				menu.setAttribute("id", "download_menu");
				parent.appendChild(menu);
							
			}
				
			for( var k in media )	{
				var m = media[k];

				var imageUrl = "";
				if( "ext" in m && m.ext in EXT_IMAGES  )	imageUrl = EXT_IMAGES[m.ext];
		
				var spani = document.createElement( "span" );
		
				var img = document.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("src", imageUrl);
				spani.appendChild(img);

				var txt = document.createElement( "span" );
				txt.setAttribute("style", "margin-left:5px;");
				if (m.format)	{
					txt.textContent = m.format + '.'+m.ext;
				}
				else	{
					if (m.title.length > 25)		{
						txt.textContent = m.title.substr(0,23) + '... .'+m.ext;
					}
					else	{
						txt.textContent = m.title + ' .'+m.ext;
					}
				}	
			
				var span = document.createElement("a");
				span.setAttribute( "class", "dm_button_select_item" );
				span.setAttribute("style", "width:150px; height: 30px; padding: 6px 6px 6px 10px !important;");
				span.setAttribute("id", "download_menu_"+k);
				span.appendChild( spani );					
				span.appendChild( txt );					
				
				(function( medToDownload, span ){
								span.addEventListener("click", function(){
									startDownload( medToDownload );
								}, true);
							})( m, span );
							
				menu.appendChild( span );					
			}
						
			menu.addEventListener( "click", function( event ){
								clickMenu = true;
								window.clearTimeout(clickTimer);
							});
					
			if( media.length == 0 )
			{
				var spani = document.createElement( "span" );
			
				var img = document.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("src", EXT_IMAGES['set']);
				spani.appendChild(img);
			
				var txt = document.createElement( "span" );
				txt.setAttribute("style", "margin-left:5px;");
				txt.textContent = 'Settings';
				
				var span = document.createElement("a");
				span.setAttribute( "class", "dm_button_select_item" );
				span.setAttribute("style", "width:150px; height: 26px; padding: 6px 6px 6px 10px !important;");
				span.appendChild( spani );					
				span.appendChild( txt );					
				span.addEventListener("click", function(){
								chrome.extension.sendMessage({action:"SettingOptions"  }, function( response ){} 					);
				}, true);
							
				menu.appendChild( span );		
			}											
					

		}	
		
		if( !document.getElementById( BUTTON_ID_DM ) )	{
			var button = createButtonElementDM( BUTTON_ID_DM );
					
			var block = document.querySelector('.pl_video_infos');
			
			var elemFlag_views_share = block.querySelector('.views_and_share');
			
			var elemFlag_media = block.querySelector('.media');
			elemFlag_media.setAttribute("style", "overflow: visible");

			var elemFlag_foreground = block.querySelector('.media-block');
			if (elemFlag_foreground) elemFlag_foreground.setAttribute("style", "width:170px; float:left");
			
			if( elemFlag_media )	{
				var dv = document.createElement("div");
				dv.appendChild( button );	
				elemFlag_media.appendChild( dv );					
				
				var div = document.createElement("div");
				div.setAttribute("style", "display: none; z-index: 30; position:relative; margin-left:150px");
				div.setAttribute("id", "download_container");
				dv.appendChild( div );	
			}	
		}
		
	}
	
	// ======================  VK video ==============================================================
	function buttonVKontakte( mainMedia ) {
	
		console.log('buttonVKontakte', mainMedia);
	
		const BUTTON_ID = "GetThemAll_vk_button";
		var clickTimer = null;
		var clickMenu = false;
		
	
		// -------------------------------------------------------------------------------------------
		function createButtonElementVK( buttonId )	{	
		
			var span1 = document.createElement("span");
			span1.setAttribute("style",  "margin-right:5px; ");					
		
			var img = document.createElement("img");
			img.setAttribute("src",  ADDON_IMAGE);					
			img.setAttribute("align",  "left");					
			span1.appendChild( img );

			var span2 = document.createElement("span");
			span2.setAttribute("style",  "background: url(/images/darr_on.gif) 0px 0px; width: 7px; height: 4px; display: inline-block; margin-bottom: 3px; margin-left: 5px; ");					
			
			var span3 = document.createElement("span");
			span3.setAttribute("style",  "width: 7px; height: 14px; display: inline-block;  position:absolute; top: 3px; left: 90px;  border-color: black; border-style: solid;  border-width: 0px 0px 0px 1px;	");					
			span3.appendChild( span2 );
			
			
			var span = document.createElement("span");
			span.setAttribute("style",  "display: inline-block; position:absolute; top: 2px; left: 25px; ");					
			span.textContent = chrome.i18n.getMessage("button_download");
	
			var button = document.createElement("button");
				
			button.setAttribute("data-tooltip",  BUTTON_TOOLTIP);					
			button.setAttribute("title",  BUTTON_TOOLTIP);					
			button.setAttribute("type", "button");
			button.setAttribute("id", BUTTON_ID);
			button.setAttribute("style",  "width:110px; height: 24px; padding: 0; position: relative");					
						
			button.appendChild( span1 );
			button.appendChild( span );
			button.appendChild( span3 );

			button.addEventListener( "click", function( event ){
						
							var elem = document.getElementById('download_container');
							
							var x = elem.getAttribute("style");
							if( x.indexOf( "none" ) != -1 )	{
								elem.setAttribute("style", "display: block; z-index: 30; position:relative;");
	
								chrome.extension.sendRequest({command:"getVideoData"  },	function( media ) { 	

																	buildMediaListVK( media, elem );						
								
															});
															
								document.addEventListener("click",  click_document, true);
								
							}
							else 
							{
								elem.setAttribute("style", "display: none; z-index: 30; position:relative;");
								document.removeEventListener("click", click_document, true);
							}	
							
						}, false );
			
			return button;
		}
		
		// ------------------------------------	
		function click_document( media, parent ){
			var elem = document.getElementById('download_container');
			if (elem.style.display == 'none') return;
			if ( clickMenu )
			{
				clickMenu = false;
				return;
			}	

			clickMenu = false;
			clickTimer = setTimeout(function() {   
											elem.style.display = 'none';
										},  100 );
		}

		// -------------------------------------------------------------------------------------------
		function buildMediaListVK( media, button  )  {
		
			var parent = document.getElementById( "download_container" );
		
			var menus = document.getElementById('download_menu'); 
												
			var menu = null;
			if( menus )		{
				while( menus.firstChild )				{
					menus.removeChild( menus.firstChild );
				}
				menu = menus;
			}
			else	{
				menu = document.createElement( "div" );
				menu.setAttribute( "style", "position: absolute; top: -1px; left: 0; border: 1px solid #ddd; -webkit-box-shadow: rgba(0,0,0,0.3) 0 0 1px; -moz-box-shadow: rgba(0,0,0,0.3) 0 0 1px; margin-right: 0; padding: 8px 0 4px; z-index: 20; color: #666666; text-align: left;   font: 13px Arial,Helvetica,Clean,Sans-serif; background:white;" );
				menu.setAttribute("id", "download_menu");
				parent.appendChild(menu);
			}
						
			var kk = 0;					
			for( var k in media )	{
				var m = media[k];	
				
				var imageUrl = "";
				if( "ext" in m && m.ext in EXT_IMAGES  )	imageUrl = EXT_IMAGES[m.ext];
		
				var spani = document.createElement( "span" );
		
				var img = document.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("src", imageUrl);
				spani.appendChild(img);

				var txt = document.createElement( "span" );
				txt.setAttribute("style", "margin-left:5px;");
				txt.textContent = m.format;
			
				var span = document.createElement("a");
				span.setAttribute("class", "mvs_act");
				span.setAttribute("style", "width:120px; padding: 6px 6px 6px 10px !important; display: block;   font-size: 13px;    height: 16px;   white-space: nowrap; cursor:pointer;");
				
				span.setAttribute("id", "download_menu");
				span.appendChild( spani );					
				span.appendChild( txt );					
			
				(function( medToDownload, span ){
								span.addEventListener("click", function(){
												startDownload( medToDownload );
											}, true);
								span.addEventListener("mouseover", function(){
												span.style.background = "#cde0e6";
											}, true);
								span.addEventListener("mouseout", function(){
												span.style.background = "white";
											}, true);
							})( m, span );
							
				menu.appendChild( span );
				kk++;	
			}
			
			if (kk==0) {	
				var spani = document.createElement( "span" );
			
				var img = document.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("src", EXT_IMAGES['set']);
				spani.appendChild(img);
			
				var txt = document.createElement( "span" );
				txt.setAttribute("style", "margin-left:5px;");
				txt.textContent = 'Settings';
				
				var span = document.createElement("a");
				span.setAttribute( "class", "dm_button_select_item" );
				span.setAttribute("style", "width:150px; height: 22px; padding: 6px 6px 6px 10px !important;");
				span.appendChild( spani );					
				span.appendChild( txt );					
				span.addEventListener("click", function(){
								chrome.extension.sendMessage({action:"SettingOptions"  }, function( response ){} 					);
				}, true);
							
				menu.appendChild( span );		
			}
		}
		
	
		// ----------------------------			
		if( !document.getElementById(BUTTON_ID) ){
				
			var button = createButtonElementVK( BUTTON_ID );
	
			var elemFlag = document.getElementById("mv_controls_line");	
			elemFlag.style.display = "block";
			
			if( elemFlag )
			{
				var dv = document.createElement("div");
				dv.setAttribute("style", "margin-left: 10px; float:right; ");
				dv.appendChild( button );	
				elemFlag.appendChild( dv );
					
				var div = document.createElement("div");
				div.setAttribute("style", "display: none; z-index: 30; position:relative;");
				div.setAttribute("id", "download_container");
				dv.appendChild( div );	
			}
		}
	
	}
	// ======================  VK Audio ==============================================================
	function iconVKontakte( media, port ) {
		
		console.log("iconVKontakte", media);
		
		if (media == null) return;
		
		var elem = document.getElementById('download_' + media.videoId);	
		
		if (elem) return;

		var block = document.getElementById('audio_' + media.videoId);
		add_icon(block)

		// ------------------------------
		function add_icon(block) {
			
			if (!block) return;

			var div = document.createElement("div");
			div.setAttribute("class", "play_btn fl_l");
			div.setAttribute("id", "download" + media.id);
			div.setAttribute("style", "width:20px");
		
			var div1 = document.createElement("div");
			div1.setAttribute("class", "play_btn_wrap");
			div1.setAttribute("style", "padding-left:0px");
			div.appendChild( div1 );	
		
			var div2 = document.createElement("div");
			div2.setAttribute("style", "width:16px; height:16px; float:left; margin-top: 5px;");
			div2.setAttribute("title", "Download");
			div1.appendChild( div2 );	

			var img = document.createElement("img");
			img.setAttribute("src",  EXT_IMAGES["fvd"]);					
			div2.appendChild( img );
			
			block.insertBefore( div, block.querySelector('div') );
			
		}
	
		
	}	
	
	// ======================  FaceBook Video ==============================================================
	function iconFaceBook( media, port ) {

		console.log("iconFaceBook", media);
		
		if (media == null) return;

		if (media && media.length > 0) {
			for (var i=0; i<media.length; i++)		{
				var cont_id = "download_" + media[i].videoId;
				if ( media[i].videoId && !document.getElementById( cont_id ) ) {
					findBlock( media[i], cont_id );
					
				}
			}	
		}	
		
		// ------------------------------
		function findBlock( media, cont_id ) {
			var elems = document.querySelectorAll('div[data-fte]');
			for (var i=0; i<elems.length; i++) {
				var ee = elems[i].querySelector('[data-video-id="'+media.videoId+'"]');
				if (!ee)  ee = elems[i].querySelector('input[value="'+media.videoId+'"]');	
				if (ee) {
					get_title(elems[i], media.tabId, media.videoId);	
					add_icon(find_action(elems[i]), media);
				}
			}	
		}	
		
		function get_title(eee, tabId, videoId) {
			var e = eee.querySelector('h5') || eee.querySelector('h6');
			var title = e.innerHTML;
			title = title.replace(/<span aria-hidden="true">(.?)<\/span>/gm,'' )
						 .replace(/<[^>]*>/gm,'')
						 .replace(/&nbsp;/gm,' ')
						 .replace(/&(.+?);/gm,'');
				
			if (title) {  
				chrome.extension.sendRequest({	akce:"set_FaceBook_Media_title",  
												tabId: tabId,	
												videoId: videoId,	
												title: title  },	
										function( response ){  });
			}

		}
		
		// ------------------------------
 		function find_action( block ) {
			
			var ff = block.querySelector('form.commentable_item');
			if ( !ff ) return null;
			
			var fff = ff.querySelector('div');
			if ( !fff ) return null;
			var fff = fff.querySelector('div._37uu');
			if ( !fff ) return null;
			
			var ee = fff.querySelector('div._42nr');
			if (ee) var sp = ee.querySelector('span');
			if (sp) {
				return sp;
			}	 

			return null;	
		}	 

		// ------------------------------
		function add_icon( elem, m ) {
			
			if (!elem) return;
			
			var id = "download_" + m.videoId;
			
			if ( document.getElementById( id ) ) return;
			
			var span = document.createElement("span");
			span.setAttribute("id", id);
			span.setAttribute("style", "float: left; margin-top: 3px; cursor: pointer;");
			elem.parentNode.insertBefore( span, elem );
			
			var div = document.createElement("div");
			div.setAttribute("title", "Download");
			span.appendChild( div );	

			(function( medToDownload, div ){
							div.addEventListener("click", function(e){
											startDownload( medToDownload );
											e.stopPropagation();
										}, true);
						})( m, div );
			
			var img = document.createElement("img");
			img.setAttribute("src",  EXT_IMAGES["fvd"]);					
			div.appendChild( img );
			
		}
	
	}
	
	// ====================================================================================
	
	chrome.extension.onConnect.addListener(function( port ){				
		
		var pendingRequestLastId = 0;
		var pendingRequests = {};
		
		// --------------------
		function addRequest( message, callback ){
			var requestId = pendingRequestLastId;
			pendingRequestLastId++;
			
			message.requestId = requestId;
			
			pendingRequests[ requestId ] = callback;
						
			port.postMessage( message );
		}
		
		// --------------------
		function downloadMediaItemRequest( media ){
			
			port.postMessage( {
						action: "download",
						media: media
					} );
			
		}
		
		// --------------------
		function getOffset( obj ) {
			var curleft = curtop = 0;
			if (obj.offsetParent) 
			{
				do 
				{
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				}
				while(obj = obj.offsetParent);
			}
			return {	"left": curleft,	"top": curtop	};
		}
		// --------------------
	
	
		port.onMessage.addListener( function( message ){
	
			switch( message.action ){
								
				// ====================================================================================
				case "answer":
				
					var requestId = message.requestId;
					if( pendingRequests[ requestId ] )
					{
						pendingRequests[ requestId ]( message );
						delete pendingRequests[ requestId ];
					}
					else
					{
						console.log( "Undefined answer", message );
					}					
				
				break;
				
				// ====================================================================================
				case "startDownload":
					
					var media = message.media;
					
					console.log( 'startDownload', media.url );
					
					downloadMediaItem( media );

				break;
				
				// ====================================================================================
				case "insertDMButton":
				
					var media = message.media;
					
					buttonDailyMotion( media, port );
				
				break;

				// ====================================================================================
				case "insertVKButton":
				
					var media = message.media;
					
					buttonVKontakte( media );
				
				break;

				// ====================================================================================
				case "insertVK_AudioButton":
				
					var media = message.media;
					
					for (var i=0; i<media.length; i++) {
						iconVKontakte( media[i], port );
					}	
				
				break;

				// ====================================================================================
				case "query_content":
				
					curHref = null;
					getPage_url();
				
				break;
				
				// ====================================================================================
				case "canShowRateDialog":
				
					setTimeout( function() {
					
									displayRateMessage(message.type);			
									
								}, 200 );
				
				break;
				
				// ====================================================================================
				case "insertFaceBook_VideoButton":
				
					var media = message.media;
					
					iconFaceBook( media, port );
				
				break;

				// ====================================================================================

			}
			
		} );

		
	});
	
})();

