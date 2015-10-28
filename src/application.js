var v = 'function a() {\n    return [];\n}'
var v2 = 'function a() {\n    l = 2;\n    return [x, l];\n}'



$(document).ready(function() {
	var leftEditor = CodeMirror.fromTextArea($('#left > textarea')[0], 
		{indentUnit: 4, lineNumbers: true, mode: 'javascript'});
	var rightEditor = CodeMirror.fromTextArea($('#right > textarea')[0],
	    {indentUnit: 4, lineNumbers: true, mode: 'javascript'});
	leftEditor.setValue(v);
	rightEditor.setValue(v2);

	$('#show').on('click', function(event) {
		var diff = diffAST(leftEditor.getValue(), rightEditor.getValue());
		if (diff.status == 'error') {
			$('#error').html(diff.message);
			$('#error').show();
		}
		else {
			$('#error').hide();
			visualizeTree(diff.tree);
		}
	})
})

function diffToNodes(diffTree, top) {
	if ($.isArray(diffTree)) {
		return _.map(diffTree, function(node) { return diffToNodes(node, top); });
	}
	else if (!$.isPlainObject(diffTree)) {
		return diffTree;
	}
	var supportingChildren = {
		FunctionDeclaration: ['params', 'body.body'],
		BlockStatement: ['body'],
		ReturnStatement: ['argument'],
		ArrayExpression: ['elements'],
		ExpressionStatement: ['expression']
	};
	var node = {
		text: nodeText(diffTree),
		collapsed: false,
		HTMLclass: toColor(diffTree, top)
	};
	
	if (supportingChildren[diffTree.type] !== undefined) {
		node.children = _.map(supportingChildren[diffTree.type], function(child) {
			var splits = child.split('.');
			var element = _.reduce(splits, function (elem, sp) { return elem[sp]; }, diffTree);
			var generation = diffToNodes(element, diffTree.changed != 'same' && diffTree.changed !== undefined ? diffTree.changed : top);
			var nodes = $.isArray(generation) ? generation : [generation];
			return {text: {name: splits[splits.length - 1]}, HTMLclass: toColor(diffTree, top), children: nodes, collapsed: nodes.length == 0};
		});
	}
	return node;
}

function nodeText(diffTree) {
	if (diffTree.type == 'Literal') {
		return {name: diffTree.value, desc: 'Literal'};
	}
	else if (diffTree.type == 'Identifier') {
		return {name: diffTree.name, desc: 'Identifier'};
	}
	else {
		return {name: diffTree.type};
	}
}

function toColor(diffTree, top) {
	return top == 'same' ? diffTree.changed : top;
}

function visualizeTree(diffTree) {
	$('#diff > *').remove();
	var chartConfig = {
	    chart: {
	        container: "#diff",

	        animateOnInit: true,
	        
	        node: {
	            collapsable: true
	        },
	        animation: {
	            nodeAnimation: "easeOutBounce",
	            nodeSpeed: 700,
	            connectorsAnimation: "bounce",
	            connectorsSpeed: 700
	        }
	    },
	    nodeStructure: diffToNodes(diffTree, 'same')
	};
	window.d = diffTree
	window.c = chartConfig
	var visibletree = new Treant(chartConfig);
}