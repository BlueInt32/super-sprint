﻿class ConstsDef
	constructor:()->
		@METER = 100;
		@STAGE_WIDTH_PIXEL= 1000;
		@STAGE_WIDTH_B2 = @STAGE_WIDTH_PIXEL / @METER;
		@STAGE_HEIGHT_PIXEL= 750;
		@STAGE_HEIGHT_B2 = @STAGE_HEIGHT_PIXEL / @METER;
		@DEGTORAD = 2 * Math.PI / 360;

		@ScreenCenterVector = new b2.cMath.b2Vec2(@STAGE_WIDTH_B2 / 2, @STAGE_HEIGHT_B2 / 2);