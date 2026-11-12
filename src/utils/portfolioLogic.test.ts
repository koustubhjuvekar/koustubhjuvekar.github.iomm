import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getVisibleCategories,
  getVisibleSubProjects,
  nextCertificateIndex,
  recordProjectVisit,
  getActiveRecentProjects,
  validateContactForm,
  filterLabCommands,
} from './portfolioLogic';
import {
  PROJECT_CATEGORIES_LIBRARY,
  WEBSERVER_QUICK_COMMANDS,
  DEFAULT_PORTFOLIO_CONTENT,
  getOrCreateProjectDetail,
} from '../data/portfolioData';

test('getVisibleCategories limits categories when showAll is false and returns all when true', () => {
  const initial = getVisibleCategories(PROJECT_CATEGORIES_LIBRARY, false, 4);
  assert.equal(initial.length, 4);
  const expanded = getVisibleCategories(PROJECT_CATEGORIES_LIBRARY, true, 4);
  assert.equal(expanded.length, 8);
});

test('getVisibleSubProjects paginates AWS project items for See More button', () => {
  const awsProjects = PROJECT_CATEGORIES_LIBRARY[0].projects || [];
  assert.equal(getVisibleSubProjects(awsProjects, false, 4).length, 4);
  assert.equal(getVisibleSubProjects(awsProjects, true, 4).length, 10);
});

test('nextCertificateIndex wraps around banner slides in both directions', () => {
  assert.equal(nextCertificateIndex(0, 2, 'next'), 1);
  assert.equal(nextCertificateIndex(1, 2, 'next'), 0);
  assert.equal(nextCertificateIndex(0, 2, 'prev'), 1);
});

test('recordProjectVisit deduplicates and tracks 15s countdown timer', () => {
  const now = 5_000_000;
  let history = recordProjectVisit(
    [],
    { id: 'aws-01-webserver', name: '01. Web Server Installation on AWS EC2', categoryTitle: 'AWS Projects', hasLab: 'webserver' },
    now,
    5,
    15_000
  );
  history = recordProjectVisit(
    history,
    { id: 'aws-02-3tier', name: '02. Three-Tier VPC Architecture', categoryTitle: 'AWS Projects', hasLab: '3tier' },
    now + 1000,
    5,
    15_000
  );

  const active = getActiveRecentProjects(history, now + 3000);
  assert.equal(active.length, 2);
  assert.equal(active[0].id, 'aws-02-3tier');
  assert.equal(active[0].remainingSeconds, 13);
});

test('validateContactForm and filterLabCommands work accurately', () => {
  const invalid = validateContactForm({ name: '', email: 'bad', subject: 'a', message: 'short' });
  assert.equal(invalid.valid, false);

  const valid = validateContactForm({
    name: 'Koustubh',
    email: 'test@example.com',
    subject: 'Cloud Role',
    message: 'Looking forward to connecting on AWS Cloud projects.',
  });
  assert.equal(valid.valid, true);

  const cmds = filterLabCommands(WEBSERVER_QUICK_COMMANDS, 'httpd');
  assert.ok(cmds.length >= 6);
});

test('getOrCreateProjectDetail returns existing lab steps or generates editable template for any project', () => {
  const existing = getOrCreateProjectDetail(
    DEFAULT_PORTFOLIO_CONTENT,
    'aws-01-webserver',
    '01. Web Server Installation on AWS EC2'
  );
  assert.equal(existing.steps.length, 15);
  assert.equal(existing.quickCommands.length, 14);
  assert.equal(existing.faqs.length, 8);

  const generated = getOrCreateProjectDetail(
    DEFAULT_PORTFOLIO_CONTENT,
    'aws-03-autoscaling',
    '03. EC2 Auto Scaling Setup',
    'EC2 • Auto Scaling'
  );
  assert.equal(generated.id, 'aws-03-autoscaling');
  assert.equal(generated.title, '03. EC2 Auto Scaling Setup');
  assert.equal(generated.layoutType, 'lab');
});

