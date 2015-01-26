
Ext.Loader.setPath('Ext.ux.form', '../js');
Ext.define('Main.Article', {
    extend: 'Ext.data.Model',
    fields: [
        'id',
        'title',
        'link',
        {name: 'pubDate', type: 'date'},
        'category',
        'author',
        'content'
    ]
});

var articles = Ext.create('Ext.data.Store', {
    storeId: 'articles',
    model: 'Main.Article',
    autoLoad: true,
    proxy: {
            type: 'ajax',
            url: '/main/list',
            filterParam: 'q',
            reader: {
                type: 'json',
                root: 'articles',
            }
        }
});

var categories = Ext.create('Ext.data.Store', {
    fields: ['category'],
    data : [{'category': 'Local:notes'}, {'category': 'Local:bugs'}]
});

var search = Ext.create('Ext.ux.form.SearchField',{
    store: articles,
    fieldLabel: 'Search',
    labelAlign: 'right',
    width: 400
});

Ext.define('Main.Form', {
    extend: 'Ext.window.Window',
    id:'formWindow',
    title: 'Add new entry',
    floating: true,
    closable : true,
    layout: 'fit', width: 600, height: 400,
    items: {
        xtype:'form',
        url: '/main/create',
        bodyPadding: '12',
        defaultType: 'textfield',
        border: false,
        fieldDefaults: {
            labelAlign: 'right',
            anchor:'100%',
            labelWidth: 85,
            msgTarget: 'side'
        },
        items:[{
            fieldLabel: 'Title',
            name: 'title'
        },{
            xtype:'combobox',
            fieldLabel: 'Category',
            store: categories,
            name: 'category',
            displayField:'category' 
        },
        {
            fieldLabel: 'Link',
            name: 'link',
        },
        {
            xtype: 'textarea',
            fieldLabel: 'Content',
            name: 'content',
            height:180
        },
        {
            fieldLabel: 'Author',
            name: 'author',
        }],
        buttons: [{
            text: 'Cancel',
            handler: function () {
                this.up('.window').close();
            }
        },{
            text: 'Save',
            handler: function() {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        success: function(form, action) {
                            Ext.data.StoreManager.get("articles").reload();
                            Ext.getCmp('formWindow').close();
                            Ext.Msg.alert('Succes', action.result.msg);
                        },
                        failure: function(form, action) {
                            Ext.Msg.alert('Failed', action.result.msg);
                        }
                    });
                }
            }
        }]
    }
});
Ext.define('Main.List', {
    extend: 'Ext.grid.Panel',
    store: 'articles',
    columns: [
          {text: "Published", dataIndex: 'pubDate',renderer : Ext.util.Format.dateRenderer('Y-m-d h:i')},
          {text: "Title", dataIndex: 'title',flex: 1},
          {text: "Category", dataIndex: 'category'},
          {text: "Author", dataIndex: 'author'}
    ],
    remoteFilter:true,
    dockedItems: [{
        dock: 'top',
        xtype: 'toolbar',
        items: [{ 
            xtype: 'button',
            iconCls  :'create-article',
            text: 'create',
            handler: function(){
                Ext.create('Main.Form').show();
                }
            },
            search
        ]
    }]
});
var grid = Ext.create('Main.List', {
                region: 'west',
                title: 'Articles',
                width:'50%',
                collapsible: true
            });
grid.getSelectionModel().on('selectionchange', function(sm, selectedRecord) {
        if (selectedRecord.length) {
            Ext.getCmp('detailPanel').update(selectedRecord[0].data.content)
        }
    });

Ext.define('Main.Details', {
    extend: 'Ext.panel.Panel',
    title: 'Details',
    collapsible: true
});
Ext.onReady(function(){
    Ext.create('Ext.container.Viewport', {
        layout: 'border',
        items: [grid,
            Ext.create('Main.Details', {
                    id: 'detailPanel',
                    region: 'east',
                    width:'50%'
            })
        ]
    });



});