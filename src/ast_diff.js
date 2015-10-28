function diffAST(previous, next) {
    var previousAST = esprima.parse(previous);
    var nextAST = esprima.parse(next);

    window.a = previousAST;
    window.b = nextAST;
    console.log(previousAST);
    console.log(nextAST);

    var ok = ensureSingleFunction(previousAST);
    if (ok) { 
        ok = ensureSingleFunction(nextAST);
    }
    if (!ok) {
        return {status: 'error', message: 'expected a single function'};
    }
    else {
        return {status: 'ok', tree: new Differ().diffFunctions(previousAST.body[0], nextAST.body[0])};
    }
}

Differ = function () {
}

function ensureSingleFunction(ast) {
    return ast.body.length == 1 && ast.body[0].type == 'FunctionDeclaration'
}

Differ.prototype.diffFunctions = function(previous, next) {
    var diff = {type: 'FunctionDeclaration'};
    diff.id = this.diffIdentifiers(previous.id, next.id);
    diff.params = this.diffParams(previous.params, next.params);
    diff.body = this.diffBlocks(previous.body, next.body);
    return diff;
}

Differ.prototype.diffIdentifiers = function(previous, next) {
    if (previous.name != next.name) {
        return {type: 'Identifier', name: next.name, changed: 'change'};
    }
    else {
        return {type: 'Identifier', name: next.name, changed: null};
    }
}

Differ.prototype.diffBlocks = function(previous, next) {
    return {type: 'BlockStatement', body: this.diffMany(previous.body, next.body)};
}

Differ.prototype.diffParams = function(previous, next) {
    return this.diffMany(previous, next);
}

Differ.prototype.diffMany = function(previousExpressions, nextExpressions) {
    var common = this.lcs(previousExpressions, nextExpressions);
    
    if (common.endPrevious - common.startPrevious < 1) {
        _.each(previousExpressions, function(expr) {
            expr.changed = 'remove';
        });
        _.each(nextExpressions, function(expr) {
            expr.changed = 'add';
        });
        return previousExpressions.concat(nextExpressions);
    }
    else {
        _.each(previousExpressions, function(expr) {
            expr.changed = 'same';
        });
        var before = this.diffMany(
            previousExpressions.slice(0, common.startPrevious),
            nextExpressions.slice(0, common.startNext));
        var after = this.diffMany(
            previousExpressions.slice(common.endPrevious),
            nextExpressions.slice(common.endNext));
        return before.concat(previousExpressions, after);
    }
}

Differ.prototype.lcs = function(sequence, other) {
  var sequenceSub = sequence.slice(0, sequence.length - 1);
  var otherSub = other.slice(0, other.length - 1);
 
  if (sequence.length === 0) {
    return {startPrevious: 0, endPrevious: 0, startNext: other.length, endNext: other.length};
  }
  else if (other.length === 0) {
    return {startPrevious: sequence.length, endPrevious: sequence.length, startNext: 0, endNext: other.length};
  } 
  else if (_.isEqual(sequence[sequence.length - 1], other[other.length - 1])) {
    var z = this.lcs(sequenceSub, otherSub);
    return {startPrevious: z.startPrevious, endPrevious: sequence.length, startNext: z.startNext, endNext: z.startNext + sequence.length - z.startPrevious}
  }
   else {
    var x = this.lcs(sequence, otherSub);
    var y = this.lcs(sequenceSub, other);
    return (x.endPrevious - x.startPrevious > y.endPrevious - y.startPrevious) ? x : y;
  }
}

// Differ.prototype.diffSingle = function(previous, next) {
//     if (previous.type != next.type) {
//         return {}
//     }