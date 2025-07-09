/**
 * Testing Infrastructure and Utilities
 * 
 * Barton Doctrine: Comprehensive testing infrastructure with clear separation
 * of concerns, consistent test patterns, and proper test data management.
 */

import { APP_CONFIG, LLM_CONFIG, ALTITUDE_CONFIG } from './config.js';
import { validatePrompt, validateAltitude, validateModeProfile } from './validation.js';
import { globalErrorHandler } from './errorHandler.js';

/**
 * Test Configuration
 */
export const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  mockDataEnabled: true,
  verbose: APP_CONFIG.debug
};

/**
 * Mock Data Generator
 */
export class MockDataGenerator {
  constructor() {
    this.mockPrompts = [
      'I want to start a business',
      'I need help with my career',
      'I want to learn a new skill',
      'I need to plan a project',
      'I want to improve my productivity'
    ];
    
    this.mockAltitudes = ALTITUDE_CONFIG.levels;
    this.mockModes = ['blueprint_logic', 'search_prep', 'startup_foundation', 'project_management', 'learning_path'];
  }

  /**
   * Generate mock prompt
   */
  generateMockPrompt() {
    return this.mockPrompts[Math.floor(Math.random() * this.mockPrompts.length)];
  }

  /**
   * Generate mock altitude
   */
  generateMockAltitude() {
    return this.mockAltitudes[Math.floor(Math.random() * this.mockAltitudes.length)];
  }

  /**
   * Generate mock mode
   */
  generateMockMode() {
    return this.mockModes[Math.floor(Math.random() * this.mockModes.length)];
  }

  /**
   * Generate mock idea tree
   */
  generateMockIdeaTree(depth = 3) {
    const tree = [];
    for (let i = 0; i < depth; i++) {
      tree.push({
        value: `Mock idea ${i + 1}`,
        altitude: this.mockAltitudes[i % this.mockAltitudes.length],
        label: `Mock label ${i + 1}`
      });
    }
    return tree;
  }

  /**
   * Generate mock checklist
   */
  generateMockChecklist(altitude = '30k', mode = 'blueprint_logic') {
    return {
      altitude,
      name: `${ALTITUDE_CONFIG.names[altitude]} Checklist`,
      description: `Mock checklist for ${altitude} level`,
      checklist_items: [
        {
          id: 'test_item_1',
          label: 'Test Item 1',
          description: 'This is a test checklist item',
          llm_checked: true,
          llm_reason: 'Mock LLM reasoning',
          user_checked: false,
          category: 'test'
        },
        {
          id: 'test_item_2',
          label: 'Test Item 2',
          description: 'Another test checklist item',
          llm_checked: false,
          llm_reason: 'Mock LLM reasoning',
          user_checked: false,
          category: 'test'
        }
      ],
      promotion_criteria: {
        required_checks: 1,
        minimum_llm_confidence: 0.7,
        user_override_allowed: true
      }
    };
  }

  /**
   * Generate mock LLM response
   */
  generateMockLLMResponse(prompt, altitude) {
    return {
      refined_prompt: `Mock refined version of: ${prompt}`,
      questions: [
        'Mock question 1?',
        'Mock question 2?'
      ],
      altitude_context: `Mock context for ${altitude}`,
      readiness_status: 'yellow'
    };
  }
}

/**
 * Test Runner
 */
export class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.mockData = new MockDataGenerator();
  }

  /**
   * Add a test
   */
  addTest(name, testFn, timeout = TEST_CONFIG.timeout) {
    this.tests.push({ name, testFn, timeout });
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('🧪 Starting test suite...');
    
    this.results = [];
    let passed = 0;
    let failed = 0;

    for (const test of this.tests) {
      try {
        console.log(`\n📋 Running: ${test.name}`);
        
        const startTime = Date.now();
        await this.runTestWithTimeout(test);
        const duration = Date.now() - startTime;
        
        this.results.push({
          name: test.name,
          status: 'PASSED',
          duration,
          error: null
        });
        
        passed++;
        console.log(`✅ PASSED: ${test.name} (${duration}ms)`);
        
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'FAILED',
          duration: 0,
          error: error.message
        });
        
        failed++;
        console.log(`❌ FAILED: ${test.name}: ${error.message}`);
      }
    }

    this.printSummary(passed, failed);
    return { passed, failed, results: this.results };
  }

  /**
   * Run single test with timeout
   */
  async runTestWithTimeout(test) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Test timed out after ${test.timeout}ms`));
      }, test.timeout);

      test.testFn()
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Print test summary
   */
  printSummary(passed, failed) {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
  }

  /**
   * Get test results
   */
  getResults() {
    return this.results;
  }
}

/**
 * Test Utilities
 */
export const TestUtils = {
  /**
   * Assert equality
   */
  assertEquals(actual, expected, message = 'Values should be equal') {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  },

  /**
   * Assert truthy
   */
  assertTrue(value, message = 'Value should be true') {
    if (!value) {
      throw new Error(message);
    }
  },

  /**
   * Assert falsy
   */
  assertFalse(value, message = 'Value should be false') {
    if (value) {
      throw new Error(message);
    }
  },

  /**
   * Assert object has property
   */
  assertHasProperty(obj, property, message = 'Object should have property') {
    if (!obj.hasOwnProperty(property)) {
      throw new Error(`${message}: ${property}`);
    }
  },

  /**
   * Assert array contains item
   */
  assertContains(array, item, message = 'Array should contain item') {
    if (!array.includes(item)) {
      throw new Error(`${message}: ${item}`);
    }
  },

  /**
   * Assert function throws error
   */
  assertThrows(fn, errorType = Error, message = 'Function should throw error') {
    try {
      fn();
      throw new Error(message);
    } catch (error) {
      if (!(error instanceof errorType)) {
        throw new Error(`${message}: expected ${errorType.name}, got ${error.constructor.name}`);
      }
    }
  },

  /**
   * Wait for specified time
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Mock fetch response
   */
  mockFetchResponse(data, status = 200) {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    });
  }
};

/**
 * Predefined Test Suites
 */
export const TestSuites = {
  /**
   * Validation tests
   */
  validation: (runner) => {
    runner.addTest('validatePrompt - valid input', async () => {
      const result = validatePrompt('This is a valid prompt');
      TestUtils.assertTrue(result.valid, 'Valid prompt should pass validation');
      TestUtils.assertEquals(result.sanitized, 'This is a valid prompt');
    });

    runner.addTest('validatePrompt - empty input', async () => {
      const result = validatePrompt('');
      TestUtils.assertFalse(result.valid, 'Empty prompt should fail validation');
      TestUtils.assertEquals(result.errors.length, 1);
    });

    runner.addTest('validateAltitude - valid altitude', async () => {
      const result = validateAltitude('30k');
      TestUtils.assertTrue(result.valid, 'Valid altitude should pass validation');
    });

    runner.addTest('validateAltitude - invalid altitude', async () => {
      const result = validateAltitude('invalid');
      TestUtils.assertFalse(result.valid, 'Invalid altitude should fail validation');
    });

    runner.addTest('validateModeProfile - valid mode', async () => {
      const result = validateModeProfile('blueprint_logic');
      TestUtils.assertTrue(result.valid, 'Valid mode should pass validation');
    });
  },

  /**
   * Configuration tests
   */
  configuration: (runner) => {
    runner.addTest('APP_CONFIG - has required properties', async () => {
      TestUtils.assertHasProperty(APP_CONFIG, 'name');
      TestUtils.assertHasProperty(APP_CONFIG, 'version');
      TestUtils.assertHasProperty(APP_CONFIG, 'environment');
    });

    runner.addTest('LLM_CONFIG - has provider configs', async () => {
      TestUtils.assertHasProperty(LLM_CONFIG, 'openai');
      TestUtils.assertHasProperty(LLM_CONFIG, 'anthropic');
    });

    runner.addTest('ALTITUDE_CONFIG - has correct levels', async () => {
      TestUtils.assertEquals(ALTITUDE_CONFIG.levels.length, 4);
      TestUtils.assertContains(ALTITUDE_CONFIG.levels, '30k');
      TestUtils.assertContains(ALTITUDE_CONFIG.levels, '5k');
    });
  },

  /**
   * Error handling tests
   */
  errorHandling: (runner) => {
    runner.addTest('ErrorHandler - handles errors correctly', async () => {
      const error = new Error('Test error');
      const response = globalErrorHandler.handleError(error, { test: true });
      
      TestUtils.assertHasProperty(response, 'statusCode');
      TestUtils.assertHasProperty(response, 'body');
      TestUtils.assertFalse(response.body.success);
    });

    runner.addTest('ErrorHandler - creates user-friendly messages', async () => {
      const { createUserFriendlyMessage } = await import('./errorHandler.js');
      const message = createUserFriendlyMessage({ code: 'LLM_ERROR' });
      TestUtils.assertTrue(message.length > 0, 'Should return user-friendly message');
    });
  },

  /**
   * Mock data tests
   */
  mockData: (runner) => {
    const mockData = new MockDataGenerator();

    runner.addTest('MockDataGenerator - generates valid prompts', async () => {
      const prompt = mockData.generateMockPrompt();
      TestUtils.assertTrue(prompt.length > 0, 'Should generate non-empty prompt');
    });

    runner.addTest('MockDataGenerator - generates valid altitudes', async () => {
      const altitude = mockData.generateMockAltitude();
      TestUtils.assertContains(ALTITUDE_CONFIG.levels, altitude);
    });

    runner.addTest('MockDataGenerator - generates valid idea trees', async () => {
      const tree = mockData.generateMockIdeaTree(3);
      TestUtils.assertEquals(tree.length, 3);
      TestUtils.assertHasProperty(tree[0], 'value');
      TestUtils.assertHasProperty(tree[0], 'altitude');
    });
  }
};

/**
 * Run all test suites
 */
export async function runAllTests() {
  const runner = new TestRunner();
  
  // Add all test suites
  Object.values(TestSuites).forEach(suite => suite(runner));
  
  // Run tests
  return await runner.runTests();
}

/**
 * Run specific test suite
 */
export async function runTestSuite(suiteName) {
  const runner = new TestRunner();
  
  if (TestSuites[suiteName]) {
    TestSuites[suiteName](runner);
    return await runner.runTests();
  } else {
    throw new Error(`Unknown test suite: ${suiteName}`);
  }
}

/**
 * Performance testing utilities
 */
export const PerformanceUtils = {
  /**
   * Measure function execution time
   */
  async measureExecutionTime(fn, iterations = 1) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return { avg, min, max, times };
  },

  /**
   * Memory usage measurement
   */
  measureMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}; 