sap.designstudio.sdk.DataBuffer.subclass("com.tcs.worldbankdatasource.WorldBankDataSource", function()
{

	var that = this;

	var _countries = "in";
	var _indicators = "IT.NET.USER.P2";
	var _range = "2001:2013";
	
	this.init = function()
	{
		this.defineDimensions([
			       				{
			       				"key": "year",
			       				"text": "Year",
			       				"axis": "COLUMNS"
			       				}, {
			       				"key": "Indicators",
			       				"text": "Indicators",
			       				"axis": "ROWS",
			       				"containsMeasures": true
			       				}, {
			       				"key": "Country",
			       				"text": "Country",
			       				"axis": "ROWS"
			       				}
			       			  ]
			       			 );
	};
	
	this.countries = function(value) 
	{
		if (value === undefined) 
		{
			return _countries;
		} 
		else 
		{
			_countries = value;
			return this;
		}
	};
	
	this.range = function(value) 
	{
		if (value === undefined) 
		{
			return 	_range;
		} 
		else 
		{
			_range = value;
			return this;
		}
	};
	
	this.indicators = function(value) 
	{
		if (value === undefined) 
		{
			return _indicators;
		} 
		else 
		{
			_indicators = value;
			return this;
		}
	};
	
	this.afterUpdate = function()
	{
		this.clear();
		var url = "http://api.worldbank.org/countries/"+_countries;
		url = url + "/indicators/"+_indicators;
		url = url + "?date="+_range;
		url = url + "&per_page=1000&format=jsonp&prefix=getdata";
		$.ajax(
				{
					async: false,
					dataType: 'jsonp',
					jsonpCallback: "getdata",
					url: url
				}
			  ).done(function(jsonData) {process(jsonData);});
	};
	
	function process(jsonData)
	{
		var crosstab = [];
		var len = jsonData[1].length;
		var row=[];
		crosstab[0]=[""];
		var indicator = jsonData[1][0].indicator.value;
		var numberofCountries = 0;
		for(var o = 0; o<len; o++)
		{
			var isPresent = false;
			for(var i = 0;i<row.length;i++)
			{
				if(jsonData[1][o].country.value==row[i])
				{
					isPresent = true;
					break;
				}
			}
			if(isPresent==false)
			{
				row[numberofCountries] = [jsonData[1][o].country.value];
				numberofCountries++;
			}
		}
		var desc = 0;
		var numberofYears = len/numberofCountries;
		for(var o = 0;o<numberofCountries;o++)
		{
			for(var i=0;i<numberofYears;i++)
			{
				desc = numberofYears - i - 1 + (o*numberofYears);
				crosstab[0][i+1] = jsonData[1][desc].date;
				if((jsonData[1][desc].value)!=null)
				{
					row[o][i+1]=parseFloat((jsonData[1][desc].value));
				}
				
				else
				{
					row[o][i+1]= 0;
				}
			}
			crosstab[o+1]=row[o];
		}
		for(var C1 = 0; C1 < numberofCountries; C1++ )
		{
			for(var C2 = 0; C2 < numberofYears; C2++)
			{
				that.setDataCell([crosstab[0][C2+1], indicator, crosstab[C1+1][0]], parseFloat(crosstab[C1+1][C2+1]).toFixed(2));
			}
		}
		that.fireUpdate(true);
	}
	
});
