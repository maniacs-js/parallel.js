describe('API', () => {
  const isNode = typeof module !== 'undefined' && module.exports;
  const Parallel = isNode ? require('../../lib/parallel.js') : self.Parallel;

  function addOne(el) {
    return el + 1;
  }

  function sum(a, b) {
    return a + b;
  }

  it('should be a constructor', () => {
    expect(Parallel).toEqual(jasmine.any(Function));
  });

  it('should define a .then(cb) function', () => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
    expect(p.then).toEqual(jasmine.any(Function));
  });

  it('should define a .map(cb) function', () => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
    expect(p.map).toEqual(jasmine.any(Function));
  });

  it('should define a require(string|function|{ name: string, fn: function }) function', () => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
    expect(p.require).toEqual(jasmine.any(Function));
  });

  it('should execute a .then function without an operation immediately', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
    expect(p.then).toEqual(jasmine.any(Function));

    p.then(() => {
      expect('finished').toEqual('finished');
      done();
    });
  });

  it('should execute .spawn() correctly', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.spawn((data) => {
      return ['something', 'completly', 'else'];
    }).then((data) => {
      expect(data).toEqual(['something', 'completly', 'else']);
      done();
    });
  });

  it('should .spawn() handle errors', (done) => {
    if (isNode) {
      done();
      return;
    }

    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.spawn((data) => {
      throw ('Test error');
      return ['something', 'completly', 'else'];
    }).then(() => {}, (error) => {
      expect(typeof error).toEqual('object');
      expect(error.message).toMatch(/Test\serror/);
      done();
    });
  });

  it('should .map() correctly', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.map(addOne).then((data) => {
      expect(data).toEqual([2, 3, 4]);
      done();
    });
  });

  it('should queue map work correctly', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js', maxWorkers: 2 });

    p.map(addOne).then((data) => {
      expect(data).toEqual([2, 3, 4]);
      done();
    });
  });

  it('should map handle error correctly', (done) => {
    if (isNode) {
      done();
      return;
    }

    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js', maxWorkers: 2 });

    p.map((el) => {
      if (el === 2) throw ('Test error');
      return el + 1;
    }).then(() => {}, (error) => {
      expect(typeof error).toEqual('object');
      expect(error.message).toMatch(/Test\serror/);
      done();
    });
  });

  it('should only fire promise once for errors + successful calls', (done) => {
    if (isNode) {
      done();
      return;
    }

    const p = new Parallel([1, 2, 3], { evalPath: 'lib/eval.js' });
    let fires = 0;

    p.map((el) => {
      if (el === 1) throw new Error('a');
      return el;
    }).then((data) => {
      fires++;
      expect(fires).toEqual(1);
      done();
    }, () => {
      fires++;
    });
  });

  it('should chain .map() correctly', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.map(addOne).map((el) => {
      return el - 1;
    }).then((data) => {
      expect(data).toEqual([1, 2, 3]);
      done();
    });
  });

  it('should mix .spawn and .map() correctly', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.map(addOne).spawn((data) => {
      return data.reduce((a, b) => {
        return a + b;
      });
    }).then((data) => {
      expect(data).toEqual(9);
      done();
    });
  });

  it('should execute .reduce() correctly', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.reduce((data) => {
      return data[0] + data[1];
    }).then((data) => {
      expect(data).toEqual(6);
      done();
    });
  });

  it('should reduce handle error correctly', (done) => {
    if (isNode) {
      done();
      return;
    }

    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js', maxWorkers: 2 });

    p.reduce((n) => {
      if (n[1] === 2) throw ('Test error');
      return n[0] + n[1];
    }).then(() => {}, (error) => {
      expect(typeof error).toEqual('object');
      expect(error.message).toMatch(/Test\serror/);
      done();
    });
  });

  it('should process data returned from .then()', (done) => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.map(addOne).then((data) => {
      return data.reduce(sum);
    }).then((data) => {
      expect(data).toEqual(9);
      done();
    });
  });

  it('should process data returned from .then() when errCb occurs', (done) => {
    if (isNode) {
      done();
      return;
    }
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.map((el) => {
      if (el === 2) throw ('Test error');
      return el + 1;
    }).then((data) => {}, (error) => {
      return 5;
    }).then((data) => {
      expect(data).toEqual(5);
      done();
    });
  });

  it('should process data returned from .then() when error occurs into then', (done) => {
    if (isNode) {
      done();
      return;
    }

    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });

    p.map((el) => {
      return el + 1;
    }).then((data) => {
      throw ('Test error');
    }, (error) => {
      expect(error).toMatch(/Test\serror/);
      return 5;
    }).then((data) => {
      expect(data).toEqual(5);
      done();
    }, () => {
			// some stuff
    });
  });

  if (!isNode) {
    it('should work with require()d scripts (web-exclusive)', (done) => {
      const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
      p.require('../test/test.js'); // relative to eval.js

      p.map((el) => {
        return myCalc(el, 25);
      }).then((data) => {
        expect(data).toEqual([26, 27, 28]);
        done();
      });
    });
  }

  it('should allow chaining require()', () => {
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
    const ret = p.require({ name: 'fn', fn() { } });

    expect(ret).toEqual(jasmine.any(Parallel));
  });

  it('should work with require()d anonymous functions', (done) => {
    const fn = function (el, amount) {
      return el + amount;
    };
    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
    p.require({ name: 'fn', fn });

    p.map((el) => {
      return fn(el, 25);
    }).then((data) => {
      expect(data).toEqual([26, 27, 28]);
      done();
    });
  });

  it('should accept more than one requirement', (done) => {
    function factorial(n) { return n < 2 ? 1 : n * factorial(n - 1); }

    const p = new Parallel([1, 2, 3], { evalPath: isNode ? undefined : 'lib/eval.js' });
    p.require({ name: 'sum', fn: sum }, factorial);

    p.map((el) => {
      return sum(factorial(el), 25);
    }).then((data) => {
      expect(data).toEqual([26, 27, 31]);
      done();
    });
  });

  it('should allow environment to be passed in constructor', () => {
    const env = { a: 1, b: 2 };
    let p;
    let doneSpawn = false;
    let doneMap = false;
    let doneReduce = false;
    let resultSpawn = null;
    let resultMap = null;
    let resultReduce = null;

    runs(() => {
      p = new Parallel([1, 2, 3], {
        evalPath: isNode ? undefined : 'lib/eval.js',
        env
      });

      p.spawn((data) => {
        return global.env.a * 2;
      }).then((data) => {
        resultSpawn = data;
        doneSpawn = true;
      });

      p = new Parallel([1, 2, 3], {
        evalPath: isNode ? undefined : 'lib/eval.js',
        env
      });

      p.map((data) => {
        return data * global.env.b;
      }).then((data) => {
        resultMap = data;
        doneMap = true;
      });

      p = new Parallel([1, 2, 3], {
        evalPath: isNode ? undefined : 'lib/eval.js',
        env
      });

      p.reduce((data) => {
        return data[0] + data[1] * global.env.b;
      }).then((data) => {
        resultReduce = data;
        doneReduce = true;
      });
    });

    waitsFor(() => {
      return doneSpawn && doneMap && doneReduce;
    }, 'it should finish', 2000);

    runs(() => {
      expect(resultSpawn).toEqual(2);
      expect(resultMap).toEqual([2, 4, 6]);
      expect(resultReduce).toEqual(13);
    });
  });

  it('should allow overriding default environment', () => {
    const env = { a: 1, b: 2 };
    let p;
    let doneSpawn = false;
    let doneMap = false;
    let doneReduce = false;
    let resultSpawn = null;
    let resultMap = null;
    let resultReduce = null;

    runs(() => {
      p = new Parallel([1, 2, 3], {
        evalPath: isNode ? undefined : 'lib/eval.js',
        env
      });

      p.spawn((data) => {
        return global.env.a * 2;
      }, { a: 2 }).then((data) => {
        resultSpawn = data;
        doneSpawn = true;
      });

      p = new Parallel([1, 2, 3], {
        evalPath: isNode ? undefined : 'lib/eval.js',
        env
      });

      p.map((data) => {
        return data * global.env.b;
      }, { b: 3 }).then((data) => {
        resultMap = data;
        doneMap = true;
      });

      p = new Parallel([1, 2, 3], {
        evalPath: isNode ? undefined : 'lib/eval.js',
        env
      });

      p.reduce((data) => {
        return data[0] + data[1] * global.env.b;
      }, { b: 3 }).then((data) => {
        resultReduce = data;
        doneReduce = true;
      });
    });

    waitsFor(() => {
      return doneSpawn && doneMap && doneReduce;
    }, 'it should finish', 2000);

    runs(() => {
      expect(resultSpawn).toEqual(4);
      expect(resultMap).toEqual([3, 6, 9]);
      expect(resultReduce).toEqual(24);
    });
  });

  it('should allow configuring global namespace', (done) => {
    const p = new Parallel([1, 2, 3], {
      evalPath: isNode ? undefined : 'lib/eval.js',
      env: { a: 1 },
      envNamespace: 'other'
    });

    p.spawn((data) => {
      return global.other.a * 2;
    }).then((data) => {
      expect(data).toEqual(2);
      done();
    });
  });
});
