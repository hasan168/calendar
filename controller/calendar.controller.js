sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"],

	function( Controller,JSONModel, Filter, FilterOperator) {
		"use strict";
		
		var oData = oModel.getData();
		var obj;
		var db;
		var PageController = Controller.extend("newProject.controller.calendar", {
			
			onInit:function(){      
				var _this = this;
				_this.getView().setModel(oModel);

				db = openDatabase('kayitdb', '1.0', 'ilkdb',  2 * 1024 * 1024);

				db.transaction(function(tx){
					tx.executeSql('CREATE TABLE IF NOT EXISTS kullanici(id unique,ad,soyad,email)');                
				})

				db.transaction(function(tx){
					tx.executeSql('CREATE TABLE IF NOT EXISTS kul_randevu3(id unique, kid, kad, ksoyad, baslik, bast, bitt, yorum)');                
				})
				var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
				oRouters.getRoute("calendar").attachPatternMatched(this.fetchUserInformation, this);
			},

			fetchUserInformation: function (oEvent) {
				var _this=this;
				obj = oEvent.getParameter("arguments").details;
				db.transaction(function(tx)
				{
					tx.executeSql('SELECT * FROM kullanici WHERE id=?',[obj],function(ty,result){
						oModel.setProperty("/kplan",result.rows);
						let kid=oModel.getProperty("/kplan/0/id");
						let kad=oModel.getProperty("/kplan/0/ad");
						let ksoyad=oModel.getProperty("/kplan/0/soyad");
						let kemail=oModel.getProperty("/kplan/0/email");
						var json2 = [{
							ad: kad,
							soyad: ksoyad,
							email: kemail
						}]
						oModel.setProperty("/kullanicilar", json2);
					}); 
				})
				_this.appointmentsList(); 
			},

			appointmentsList: function () {
				db.transaction(function(tx)
				{
					tx.executeSql('SELECT * FROM kul_randevu3 WHERE kid=?',[obj],function(ty,result){
						oModel.setProperty("/kp", result.rows);
						oData.kullanicilar[0].appointments=[];
						for (var i = 0; i < result.rows.length; i++) {
							var randevu = {
								id: result.rows[i].id,
								start: new Date(result.rows[i].bast),
								end: new Date(result.rows[i].bitt),
								title: result.rows[i].baslik,
								text: result.rows[i].yorum,
								type: "Type09"
							}
							oData.kullanicilar[0].appointments.push(randevu);
							oModel.setData(oData);
						}
					}); 
				}) 
			},
			appointmentFeatures: function (oEvent) {
				var _this=this;
				var oAppointment = oEvent.getParameter("appointment");
				var oModel = this.getView().getModel();

				oModel.setProperty("/appointment",[]);

				var isim;
				var uz;
				if (oAppointment)
				{				
					var de=oAppointment.getTitle();
					var de2=oAppointment.getText();

					var bast=oEvent.mParameters.appointment.mBindingInfos.startDate.binding.oValue;
					var sont=oEvent.mParameters.appointment.mBindingInfos.endDate.binding.oValue;

					var bzaman=bast.getHours() +":"+ bast.getMinutes() +":"+ bast.getSeconds();
					var szaman=sont.getHours() +":"+ sont.getMinutes() +":"+ sont.getSeconds();

					var te=oEvent.mParameters.appointment.oBindingContexts.undefined.sPath;	
					oModel.setProperty("/uzanti",te);
					uz=oModel.getProperty("/uzanti");				

					var bt=bast.getDate() +"."+ (bast.getMonth()+1) +"."+ bast.getFullYear();
					var st=sont.getDate() +"."+ (sont.getMonth()+1) +"."+ sont.getFullYear();
					var yt=te+"/id";
					var json = {
						uzanti:te,
						id:yt,
						bs:de,
						text:de2,
						stDate:bt,
						enDate:st,
						stTime:bzaman,
						enTime:szaman
					}
					isim="GÜNCELLE";
				}
				else{
					var oModel = this.getView().getModel();
					var ekle=oModel.getProperty("/kplan");
					var oStartDate = oEvent.getParameter("startDate");
					var oEndDate = oEvent.getParameter("endDate");
					var bt=oStartDate.getDate() +"."+ (oStartDate.getMonth()+1) +"."+ oStartDate.getFullYear();
					var st=oEndDate.getDate() +"."+ (oEndDate.getMonth()+1) +"."+ oEndDate.getFullYear();
					var baslanicsaat=oStartDate.getHours() +":"+ oStartDate.getMinutes() +":"+ oStartDate.getSeconds();
					var bitissaat=oEndDate.getHours() +":"+ oEndDate.getMinutes() +":"+ oEndDate.getSeconds();
					var json = {
						bs:"",
						text:"",
						stDate:bt,
						enDate:st,
						stTime:baslanicsaat,
						enTime:bitissaat,
						kadi:ekle[0].ad,
						ksoyadi:ekle[0].soyad,
						kid:ekle[0].id
					}

					oModel.setProperty("/bas",bt);
					oModel.setProperty("/son",st);
					isim="EKLE";
				}
				oModel.setProperty("/appointment",json);

				var dialog = new sap.m.Dialog({
					title: 'PLAN '+isim,
					type: 'Message',

					
					content:[
					new sap.m.Text({ text: 'Başlık' }),
					new sap.m.Input({
						value: "{/appointment/bs}"
					}),

					new sap.m.Text({ text: 'Yorum' }),
					new sap.m.Input({
						value:"{/appointment/text}",
					}),

					new sap.m.Text({ text: 'Başlangıç Tarihi' }),
					new sap.m.DatePicker({
						value:"{/appointment/stDate}",
						valueFormat:"dd.MM.yyyy",
						displayFormat:"dd.MM.yyyy"
					}),
					new sap.m.Text({ text: 'Bitiş Tarihi' }),
					new sap.m.DatePicker({
						value:"{/appointment/enDate}",
						valueFormat:"dd.MM.yyyy",
						displayFormat:"dd.MM.yyyy"
					}),

					new sap.m.Text({ text: 'Başlangıç Saati ' }),
					new sap.m.TimePicker({
						value:"{/appointment/stTime}",
						valueFormat:"HH:mm:ss",
						displayFormat:"HH:mm:ss"
					}),
					new sap.m.Text({ text: 'Bitiş Saati ' }),
					new sap.m.
					TimePicker({
						value:"{/appointment/enTime}",
						valueFormat:"HH:mm:ss",
						displayFormat:"HH:mm:ss"
					})
					],
					customHeader:[
					new sap.m.Bar({
						contentRight:[
						new sap.m.Button({
							text: "Kapat",
							type: "Transparent",
							icon: "sap-icon://sys-cancel",
							press: function() {
								dialog.close();
							}
						})
						]
					})
					],
					beginButton: new sap.m.Button({
						text: "SİL",
						press: function () {							
							var dara=oModel.getProperty(uz+"/id");
							db.transaction(function(tx)
							{										  
								tx.executeSql('DELETE FROM kul_randevu3 WHERE id=?', [dara]);
								_this.appointmentsList(); 
								alert("VERİ SİLİNDİ");
							});
							oModel.setData(oData);
							_this.appointmentsList();
							
							dialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: isim,
						press: function () {
							var t=oModel.getProperty("/appointment");
							var p1=t.stDate.split('.');
							var a=p1[0];
							var b=p1[1];
							var c=p1[2];
							var yaz1=c+"."+b+"."+a;
							
							var p2=t.enDate.split('.');
							var z=p2[0];
							var e=p2[1];
							var f=p2[2];
							var yaz2=f+"."+e+"."+z;

							if(oAppointment){
								if (t.bs==""||t.text==""||t.stDate==""||t.enDate=="") {
									alert("LÜTFEN BOŞ ALANLARI DOLDURUNUZ");
								}
								else{
									oModel.setProperty(t.uzanti+"/title",t.bs);
									oModel.setProperty(t.uzanti+"/text",t.text);
									oModel.setProperty(t.uzanti+"/start", new Date(yaz1+" "+t.stTime));
									oModel.setProperty(t.uzanti+"/end",new Date(yaz2+" "+t.enTime));
									var ara=oModel.getProperty(t.id);
									console.log(ara);
									db.transaction(function(tx)
									{										  
										tx.executeSql('UPDATE kul_randevu3 SET bast=?, bitt=?, baslik=?, yorum=? WHERE id=?', 
											[new Date(yaz1+" "+t.stTime),new Date(yaz2+" "+t.enTime),t.bs,t.text,ara]); 
										alert("VERİ GÜNCELLENDİ");

									});
									oModel.setData(oData); 
									dialog.close();
								}
							}
							else
							{
								if (t.bs==""||t.text==""||t.stDate==""||t.enDate=="") {
									alert("LÜTFEN BOŞ ALANLARI DOLDURUNUZ");
								}
								else{
									var id=Math.random(0,20);
									var json = {
										id: id,
										start: new Date(yaz1+" "+t.stTime),
										end: new Date(yaz2+" "+t.enTime),
										title: t.bs,
										text:t.text,
										type: "Type09"					
									};
									db.transaction(function(tx)
									{										  
										tx.executeSql('INSERT INTO kul_randevu3(id, kid, kad, ksoyad, baslik, bast, bitt, yorum) VALUES(?,?,?,?,?,?,?,?)', 
											[id,t.kid,t.kadi,t.ksoyadi,t.bs,new Date(yaz1+" "+t.stTime),new Date(yaz2+" "+t.enTime),t.text]); 
										alert("VERİ EKLENDİ");
									});

									oData.kullanicilar[0].appointments.push(json);
									oModel.setData(oData); 
									dialog.close();
								}
							}
						}
					}),
					
					afterClose: function() {
						dialog.destroy();
					}
				})
				dialog.open();
			},			
		});
return PageController;
});