<template>
  <div class="dashboard">
    <header class="header">
      <div class="user">
        <div class="avatar"></div>
        <div class="info">
          <h2>Mira Philips</h2>
          <p>Elderly People Care</p>
        </div>
      </div>
      <div class="reminder">Time to take your medicine.</div>
    </header>

    <main>
      <section class="sleep">
        <div class="title">Sleep</div>
        <div class="value">5 h 42 min</div>
      </section>

      <section class="health">
        <h3>Health Parameters</h3>
        <div class="cards">
          <div class="card green">
            <div class="label">Pressure</div>
            <div class="value">100<span>/80</span></div>
          </div>
          <div class="card red">
            <div class="label">Heart beat</div>
            <div class="value">106 <span>BPM</span></div>
          </div>
          <div class="card">
            <div class="label">Mean Blood Sugar</div>
            <div class="value">115 <span>mg/dl</span></div>
          </div>
          <div class="card">
            <div class="label">SpO₂%</div>
            <div class="value green">92</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
$bg: #0f0f0f;
$card: #1a1a1a;
$text: #fff;
$green: #6bff7e;
$red: #ff4d4d;

.dashboard {
  background: $bg;
  color: $text;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Inter', sans-serif;

  .header {
    .user {
      display: flex;
      align-items: center;
      gap: 10px;

      .avatar {
        width: 45px;
        height: 45px;
        background: gray;
        border-radius: 50%;
      }

      .info {
        h2 {
          margin: 0;
          font-size: 16px;
        }
        p {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .reminder {
      background: rgba(107, 255, 126, 0.1);
      color: $green;
      margin-top: 15px;
      padding: 10px;
      border-radius: 10px;
      font-size: 14px;
    }
  }

  .sleep {
    margin: 25px 0;
    background: $card;
    border-radius: 15px;
    padding: 15px;
    .title {
      font-size: 14px;
      color: #999;
    }
    .value {
      font-size: 24px;
      font-weight: 600;
    }
  }

  .health {
    h3 {
      font-size: 16px;
      margin-bottom: 10px;
    }

    .cards {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(2, 1fr);

      .card {
        background: $card;
        border-radius: 15px;
        padding: 15px;

        .label {
          color: #999;
          font-size: 12px;
        }
        .value {
          font-size: 22px;
          font-weight: 600;

          span {
            font-size: 12px;
            color: #777;
          }

          &.green {
            color: $green;
          }
        }

        &.green .value {
          color: $green;
        }
        &.red .value {
          color: $red;
        }
      }
    }
  }
}
</style>
