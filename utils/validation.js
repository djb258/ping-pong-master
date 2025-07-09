/**
 * Centralized Input Validation System
 * 
 * Barton Doctrine: Centralized validation with clear separation of concerns,
 * consistent error handling, and comprehensive input sanitization.
 */

import { VALIDATION_CONFIG, ALTITUDE_CONFIG } from './config.js';

/**
 * Validation Error Class
 */
export class ValidationError extends Error {
  constructor(message, field, code) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * Validate user prompt input
 */
export function validatePrompt(prompt, options = {}) {
  const errors = [];
  
  // Check if prompt exists
  if (!prompt || typeof prompt !== 'string') {
    errors.push(new ValidationError('Prompt is required', 'prompt', 'REQUIRED'));
  } else {
    const trimmedPrompt = prompt.trim();
    
    // Check minimum length
    if (trimmedPrompt.length < VALIDATION_CONFIG.minPromptLength) {
      errors.push(new ValidationError(
        `Prompt must be at least ${VALIDATION_CONFIG.minPromptLength} characters`,
        'prompt',
        'MIN_LENGTH'
      ));
    }
    
    // Check maximum length
    if (trimmedPrompt.length > VALIDATION_CONFIG.maxPromptLength) {
      errors.push(new ValidationError(
        `Prompt must be no more than ${VALIDATION_CONFIG.maxPromptLength} characters`,
        'prompt',
        'MAX_LENGTH'
      ));
    }
    
    // Check for potentially harmful content
    if (containsHarmfulContent(trimmedPrompt)) {
      errors.push(new ValidationError(
        'Prompt contains potentially harmful content',
        'prompt',
        'HARMFUL_CONTENT'
      ));
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? prompt.trim() : null
  };
}

/**
 * Validate altitude level
 */
export function validateAltitude(altitude) {
  const errors = [];
  
  if (!altitude || typeof altitude !== 'string') {
    errors.push(new ValidationError('Altitude is required', 'altitude', 'REQUIRED'));
  } else if (!ALTITUDE_CONFIG.levels.includes(altitude)) {
    errors.push(new ValidationError(
      `Invalid altitude level. Must be one of: ${ALTITUDE_CONFIG.levels.join(', ')}`,
      'altitude',
      'INVALID_ALTITUDE'
    ));
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? altitude : null
  };
}

/**
 * Validate mode profile
 */
export function validateModeProfile(mode) {
  const errors = [];
  
  if (!mode || typeof mode !== 'string') {
    errors.push(new ValidationError('Mode profile is required', 'mode', 'REQUIRED'));
  } else {
    // This would need to be updated when new modes are added
    const validModes = ['blueprint_logic', 'search_prep', 'startup_foundation', 'project_management', 'learning_path'];
    if (!validModes.includes(mode)) {
      errors.push(new ValidationError(
        `Invalid mode profile. Must be one of: ${validModes.join(', ')}`,
        'mode',
        'INVALID_MODE'
      ));
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? mode : null
  };
}

/**
 * Validate idea tree structure
 */
export function validateIdeaTree(ideaTree) {
  const errors = [];
  
  if (!Array.isArray(ideaTree)) {
    errors.push(new ValidationError('Idea tree must be an array', 'ideaTree', 'INVALID_TYPE'));
    return { valid: false, errors, sanitized: null };
  }
  
  // Validate each tree branch
  const sanitizedTree = [];
  for (let i = 0; i < ideaTree.length; i++) {
    const branch = ideaTree[i];
    const branchValidation = validateTreeBranch(branch, i);
    
    if (!branchValidation.valid) {
      errors.push(...branchValidation.errors);
    } else {
      sanitizedTree.push(branchValidation.sanitized);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitizedTree : null
  };
}

/**
 * Validate individual tree branch
 */
function validateTreeBranch(branch, index) {
  const errors = [];
  
  if (!branch || typeof branch !== 'object') {
    errors.push(new ValidationError(
      `Branch at index ${index} must be an object`,
      `ideaTree[${index}]`,
      'INVALID_TYPE'
    ));
    return { valid: false, errors, sanitized: null };
  }
  
  const { value, altitude, label } = branch;
  
  // Validate value
  if (!value || typeof value !== 'string') {
    errors.push(new ValidationError(
      `Branch value at index ${index} is required and must be a string`,
      `ideaTree[${index}].value`,
      'REQUIRED'
    ));
  }
  
  // Validate altitude
  const altitudeValidation = validateAltitude(altitude);
  if (!altitudeValidation.valid) {
    errors.push(...altitudeValidation.errors.map(err => ({
      ...err,
      field: `ideaTree[${index}].${err.field}`
    })));
  }
  
  // Validate label (optional)
  if (label && typeof label !== 'string') {
    errors.push(new ValidationError(
      `Branch label at index ${index} must be a string`,
      `ideaTree[${index}].label`,
      'INVALID_TYPE'
    ));
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      value: value?.trim(),
      altitude: altitudeValidation.sanitized,
      label: label?.trim()
    } : null
  };
}

/**
 * Validate user responses
 */
export function validateUserResponses(responses) {
  const errors = [];
  
  if (!responses || typeof responses !== 'object') {
    errors.push(new ValidationError('User responses must be an object', 'responses', 'INVALID_TYPE'));
    return { valid: false, errors, sanitized: null };
  }
  
  const sanitizedResponses = {};
  
  for (const [key, value] of Object.entries(responses)) {
    if (typeof value !== 'string') {
      errors.push(new ValidationError(
        `Response for ${key} must be a string`,
        `responses.${key}`,
        'INVALID_TYPE'
      ));
    } else {
      const trimmedValue = value.trim();
      if (trimmedValue.length > VALIDATION_CONFIG.maxPromptLength) {
        errors.push(new ValidationError(
          `Response for ${key} is too long`,
          `responses.${key}`,
          'MAX_LENGTH'
        ));
      } else {
        sanitizedResponses[key] = trimmedValue;
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitizedResponses : null
  };
}

/**
 * Validate checklist data
 */
export function validateChecklist(checklist) {
  const errors = [];
  
  if (!checklist || typeof checklist !== 'object') {
    errors.push(new ValidationError('Checklist must be an object', 'checklist', 'INVALID_TYPE'));
    return { valid: false, errors, sanitized: null };
  }
  
  const { altitude, name, description, checklist_items, promotion_criteria } = checklist;
  
  // Validate altitude
  const altitudeValidation = validateAltitude(altitude);
  if (!altitudeValidation.valid) {
    errors.push(...altitudeValidation.errors);
  }
  
  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push(new ValidationError('Checklist name is required', 'name', 'REQUIRED'));
  }
  
  // Validate description
  if (description && typeof description !== 'string') {
    errors.push(new ValidationError('Checklist description must be a string', 'description', 'INVALID_TYPE'));
  }
  
  // Validate checklist items
  if (!Array.isArray(checklist_items)) {
    errors.push(new ValidationError('Checklist items must be an array', 'checklist_items', 'INVALID_TYPE'));
  } else {
    for (let i = 0; i < checklist_items.length; i++) {
      const itemValidation = validateChecklistItem(checklist_items[i], i);
      if (!itemValidation.valid) {
        errors.push(...itemValidation.errors);
      }
    }
  }
  
  // Validate promotion criteria
  if (!promotion_criteria || typeof promotion_criteria !== 'object') {
    errors.push(new ValidationError('Promotion criteria is required', 'promotion_criteria', 'REQUIRED'));
  } else {
    const criteriaValidation = validatePromotionCriteria(promotion_criteria);
    if (!criteriaValidation.valid) {
      errors.push(...criteriaValidation.errors);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? checklist : null
  };
}

/**
 * Validate checklist item
 */
function validateChecklistItem(item, index) {
  const errors = [];
  
  if (!item || typeof item !== 'object') {
    errors.push(new ValidationError(
      `Checklist item at index ${index} must be an object`,
      `checklist_items[${index}]`,
      'INVALID_TYPE'
    ));
    return { valid: false, errors, sanitized: null };
  }
  
  const { id, label, description, category } = item;
  
  // Validate id
  if (!id || typeof id !== 'string') {
    errors.push(new ValidationError(
      `Checklist item ID at index ${index} is required`,
      `checklist_items[${index}].id`,
      'REQUIRED'
    ));
  }
  
  // Validate label
  if (!label || typeof label !== 'string') {
    errors.push(new ValidationError(
      `Checklist item label at index ${index} is required`,
      `checklist_items[${index}].label`,
      'REQUIRED'
    ));
  }
  
  // Validate description (optional)
  if (description && typeof description !== 'string') {
    errors.push(new ValidationError(
      `Checklist item description at index ${index} must be a string`,
      `checklist_items[${index}].description`,
      'INVALID_TYPE'
    ));
  }
  
  // Validate category (optional)
  if (category && typeof category !== 'string') {
    errors.push(new ValidationError(
      `Checklist item category at index ${index} must be a string`,
      `checklist_items[${index}].category`,
      'INVALID_TYPE'
    ));
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? item : null
  };
}

/**
 * Validate promotion criteria
 */
function validatePromotionCriteria(criteria) {
  const errors = [];
  
  const { required_checks, minimum_llm_confidence, user_override_allowed } = criteria;
  
  // Validate required_checks
  if (typeof required_checks !== 'number' || required_checks < 1) {
    errors.push(new ValidationError(
      'Required checks must be a positive number',
      'promotion_criteria.required_checks',
      'INVALID_VALUE'
    ));
  }
  
  // Validate minimum_llm_confidence (optional)
  if (minimum_llm_confidence !== undefined) {
    if (typeof minimum_llm_confidence !== 'number' || minimum_llm_confidence < 0 || minimum_llm_confidence > 1) {
      errors.push(new ValidationError(
        'Minimum LLM confidence must be a number between 0 and 1',
        'promotion_criteria.minimum_llm_confidence',
        'INVALID_VALUE'
      ));
    }
  }
  
  // Validate user_override_allowed (optional)
  if (user_override_allowed !== undefined && typeof user_override_allowed !== 'boolean') {
    errors.push(new ValidationError(
      'User override allowed must be a boolean',
      'promotion_criteria.user_override_allowed',
      'INVALID_TYPE'
    ));
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? criteria : null
  };
}

/**
 * Check for potentially harmful content
 */
function containsHarmfulContent(text) {
  const harmfulPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];
  
  return harmfulPatterns.some(pattern => pattern.test(text));
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  html = html.replace(/javascript:/gi, '');
  
  // Remove iframe, object, and embed tags
  html = html.replace(/<(iframe|object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  return html;
}

/**
 * Validate and sanitize API request
 */
export function validateApiRequest(body, requiredFields = []) {
  const errors = [];
  const sanitized = {};
  
  // Check required fields
  for (const field of requiredFields) {
    if (!body || !body.hasOwnProperty(field)) {
      errors.push(new ValidationError(`${field} is required`, field, 'REQUIRED'));
    }
  }
  
  // If there are errors, return early
  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }
  
  // Sanitize each field
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return { valid: true, errors: [], sanitized };
} 