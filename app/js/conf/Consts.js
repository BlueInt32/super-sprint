var ConstsDef = function()
{
	this.METER = 100;
	this.STAGE_WIDTH_PIXEL= 1000;
	this.STAGE_WIDTH_B2 = this.STAGE_WIDTH_PIXEL / this.METER;
	this.STAGE_HEIGHT_PIXEL= 750;
	this.STAGE_HEIGHT_B2 = this.STAGE_HEIGHT_PIXEL / this.METER;
    this.DEGTORAD = 2 * Math.PI / 360;

    this.ScreenCenterVector = new b2.cMath.b2Vec2(this.STAGE_WIDTH_B2 / 2, this.STAGE_HEIGHT_B2 / 2);

};