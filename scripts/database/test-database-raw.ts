#!/usr/bin/env tsx

/**
 * 🗄️ Raw SQL Database Test
 * Tests PostgreSQL monitoring tables with raw SQL queries
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5432/farmersmarket",
    },
  },
});

async function testDatabaseRaw() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🗄️  RAW SQL DATABASE TEST                                ║");
  console.log("║  Farmers Market Platform - Monitoring Tables Test        ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Test 1: Database connection
    console.log("1️⃣  Testing database connection...");
    await prisma.$connect();
    console.log("   ✅ Connected to database successfully!\n");

    // Test 2: Check monitoring tables
    console.log("2️⃣  Checking monitoring tables...");
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname='public'
      AND tablename LIKE '%monitoring%' OR tablename LIKE '%workflow%' OR tablename LIKE '%notification%'
      ORDER BY tablename;
    `;
    console.log(`   ✅ Found ${tables.length} monitoring-related tables:`);
    tables.forEach((t) => console.log(`      - ${t.tablename}`));
    console.log();

    // Test 3: Insert test monitoring report
    console.log("3️⃣  Inserting test monitoring report...");
    const reportId = `test-report-${Date.now()}`;
    const now = new Date();
    const oneHourAgo = new Date(Date.now() - 3600000);

    await prisma.$executeRaw`
      INSERT INTO monitoring_reports (
        report_id, start_time, end_time,
        total_runs, successful_runs, failed_runs,
        total_duration_ms, avg_duration_ms, success_rate,
        status, report_type, generated_at, notified,
        metadata, created_at, updated_at
      ) VALUES (
        ${reportId}, ${oneHourAgo}, ${now},
        5, 4, 1,
        25000, 5000, 80.0,
        'COMPLETED', 'TEST', ${now}, false,
        '{"test": true, "environment": "test"}'::jsonb,
        ${now}, ${now}
      )
    `;
    console.log("   ✅ Report inserted successfully!");
    console.log(`   📝 Report ID: ${reportId}\n`);

    // Test 4: Insert test workflow execution
    console.log("4️⃣  Inserting test workflow execution...");
    const runId = `run-${Date.now()}`;
    const startTime = new Date(Date.now() - 5000);
    const endTime = new Date();

    await prisma.$executeRaw`
      INSERT INTO workflow_executions (
        run_id, workflow_name, status, started_at, completed_at, duration_ms,
        tests_passed, tests_failed, tests_total,
        triggered_by, environment, metadata, report_id,
        created_at, updated_at
      ) VALUES (
        ${runId}, 'health-check', 'PASSED', ${startTime}, ${endTime}, 5000,
        5, 0, 5,
        'TEST_SCRIPT', 'test', '{"workflow": "health-check"}'::jsonb, ${reportId},
        ${now}, ${now}
      )
    `;
    console.log("   ✅ Workflow execution inserted!");
    console.log(`   🔄 Run ID: ${runId}\n`);

    // Test 5: Query reports
    console.log("5️⃣  Querying monitoring reports...");
    const reports = await prisma.$queryRaw<
      Array<{
        report_id: string;
        generated_at: Date;
        total_runs: number;
        successful_runs: number;
        failed_runs: number;
        success_rate: number;
        status: string;
      }>
    >`
      SELECT report_id, generated_at, total_runs, successful_runs, failed_runs, success_rate, status
      FROM monitoring_reports
      ORDER BY generated_at DESC
      LIMIT 5
    `;
    console.log(`   ✅ Found ${reports.length} reports`);
    reports.forEach((r) => {
      console.log(
        `      - ${r.report_id}: ${r.status} (${r.success_rate}% success)`,
      );
    });
    console.log();

    // Test 6: Query workflow executions
    console.log("6️⃣  Querying workflow executions...");
    const executions = await prisma.$queryRaw<
      Array<{
        run_id: string;
        workflow_name: string;
        status: string;
        duration_ms: number;
        started_at: Date;
      }>
    >`
      SELECT run_id, workflow_name, status, duration_ms, started_at
      FROM workflow_executions
      ORDER BY started_at DESC
      LIMIT 5
    `;
    console.log(`   ✅ Found ${executions.length} executions`);
    executions.forEach((e) => {
      console.log(
        `      - ${e.workflow_name}: ${e.status} (${e.duration_ms}ms)`,
      );
    });
    console.log();

    // Test 7: Query workflow schedules
    console.log("7️⃣  Querying workflow schedules...");
    const schedules = await prisma.$queryRaw<
      Array<{
        workflow_name: string;
        cron_expression: string;
        enabled: boolean;
        description: string;
      }>
    >`
      SELECT workflow_name, cron_expression, enabled, description
      FROM workflow_schedules
      WHERE enabled = true
      ORDER BY workflow_name
    `;
    console.log(`   ✅ Found ${schedules.length} active schedules:`);
    schedules.forEach((s) => {
      console.log(`      - ${s.workflow_name}: ${s.cron_expression}`);
      console.log(`        ${s.description}`);
    });
    console.log();

    // Test 8: Aggregate statistics
    console.log("8️⃣  Collecting aggregate statistics...");
    const stats = await prisma.$queryRaw<
      Array<{
        total_reports: bigint;
        total_executions: bigint;
        avg_success_rate: number;
        total_tests_run: bigint;
      }>
    >`
      SELECT
        COUNT(DISTINCT r.id) as total_reports,
        COUNT(DISTINCT e.id) as total_executions,
        AVG(r.success_rate) as avg_success_rate,
        SUM(r.total_runs) as total_tests_run
      FROM monitoring_reports r
      LEFT JOIN workflow_executions e ON r.report_id = e.report_id
    `;
    if (stats.length > 0) {
      const stat = stats[0];
      console.log(`   📊 Total Reports: ${stat.total_reports}`);
      console.log(`   🔄 Total Executions: ${stat.total_executions}`);
      console.log(
        `   ✅ Avg Success Rate: ${stat.avg_success_rate?.toFixed(2)}%`,
      );
      console.log(`   🧪 Total Tests Run: ${stat.total_tests_run}`);
    }
    console.log();

    // Test 9: Test JOIN query
    console.log("9️⃣  Testing JOIN query (reports + executions)...");
    const joinResults = await prisma.$queryRaw<
      Array<{
        report_id: string;
        report_status: string;
        execution_count: bigint;
      }>
    >`
      SELECT
        r.report_id,
        r.status as report_status,
        COUNT(e.id) as execution_count
      FROM monitoring_reports r
      LEFT JOIN workflow_executions e ON r.report_id = e.report_id
      GROUP BY r.report_id, r.status, r.created_at
      ORDER BY r.created_at DESC
      LIMIT 5
    `;
    console.log(
      `   ✅ Found ${joinResults.length} reports with execution counts:`,
    );
    joinResults.forEach((j) => {
      console.log(`      - ${j.report_id}: ${j.execution_count} executions`);
    });
    console.log();

    // Test 10: Cleanup test data
    console.log("🔟  Cleaning up test data...");
    await prisma.$executeRaw`
      DELETE FROM workflow_executions WHERE run_id = ${runId}
    `;
    await prisma.$executeRaw`
      DELETE FROM monitoring_reports WHERE report_id = ${reportId}
    `;
    console.log("   ✅ Test data cleaned up\n");

    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  ✅ ALL DATABASE TESTS PASSED                             ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    console.log("📊 Test Summary:");
    console.log("   ✅ Database connection: Working");
    console.log("   ✅ Monitoring tables: Present and accessible");
    console.log("   ✅ INSERT operations: Working");
    console.log("   ✅ SELECT queries: Working");
    console.log("   ✅ JOIN operations: Working");
    console.log("   ✅ Aggregate functions: Working");
    console.log("   ✅ DELETE operations: Working");
    console.log("\n💡 Database storage is fully operational!");
    console.log("💡 Ready to start the monitoring daemon!\n");
  } catch (error) {
    console.error(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.error(
      "║  ❌ DATABASE TEST FAILED                                  ║",
    );
    console.error(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    console.error("Error details:");
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      if (error.stack) {
        console.error(
          `   Stack:\n${error.stack.split("\n").slice(0, 5).join("\n")}\n`,
        );
      }
    } else {
      console.error(`   ${String(error)}\n`);
    }

    console.error("💡 Troubleshooting:");
    console.error(
      "   1. Check DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:5432/farmersmarket",
    );
    console.error("   2. Verify database is running: docker-compose ps db");
    console.error(
      "   3. Check tables exist: docker-compose exec db psql -U postgres -d farmersmarket -c '\\dt'",
    );
    console.error(
      "   4. Re-run migration if needed: docker-compose exec -T db psql -U postgres -d farmersmarket < database/init/002_monitoring_tables.sql\n",
    );

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseRaw().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
