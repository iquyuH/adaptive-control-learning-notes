
clear; clc; close all;
rng(1);                 % 固定随机种子，便于重复实验

%% 1. 系统参数
a1 = -0.3874;
a2 =  0.2491;
a3 =  0.0336;

b1 =  1.9356;
b2 = -0.5524;
b3 =  0.2929;

c1 = 0.0987;
c2 = 0.0409;
c3 = 0.0793;

%% 2. 误差系统的状态空间矩阵
A0 = [-a1, 1, 0, 0;
      -a2, 0, 1, 0;
      -a3, 0, 0, 1;
        0, 0, 0, 0];

B0 = [b1; b2; b3; 0];
C0 = [1, 0, 0, 0];
D0 = [-1; -a1; -a2; -a3];

Kf = [1; c1; c2; c3];

%% 3. LQ反馈增益
Q = C0' * C0;
R = 1;

[Ku, S, poles] = dlqr(A0, B0, Q, R);
disp('LQ反馈增益 Ku = ');
disp(Ku);

%% 4. 仿真参数
T0 = 0.005;
N = 5000;
t = (0:N-1)' * T0;

yr = sin(0.1*pi*t);
v = 0.05*randn(N,1);

y = zeros(N,1);
u = zeros(N,1);
e = zeros(N,1);

xBar = zeros(4,1);     % 预测状态

%% 5. 闭环仿真
for k = 4:N

    % 由原始差分方程生成实际输出
    y(k) = -a1*y(k-1) - a2*y(k-2) - a3*y(k-3) ...
           + b1*u(k-1) + b2*u(k-2) + b3*u(k-3) ...
           + v(k) + c1*v(k-1) + c2*v(k-2) + c3*v(k-3);

    % 当前跟踪误差
    e(k) = y(k) - yr(k);

    % 状态估计
    xHat = xBar + Kf*(e(k) - C0*xBar);

    % LQ控制律
    u(k) = -Ku*xHat;

    % 下一时刻状态预测
    if k < N
        xBar = A0*xHat + B0*u(k) + D0*yr(k+1);
    end
end

%% 6. 绘图
figure;

subplot(2,1,1);
plot(t,yr,'b--','LineWidth',1.2); hold on;
plot(t,y,'r','LineWidth',1);
grid on;
legend('参考输入','实际输出');
xlabel('时间 (s)');
ylabel('输出');
title('LQG跟踪控制响应');

subplot(2,1,2);
plot(t,e,'k');
grid on;
xlabel('时间 (s)');
ylabel('跟踪误差');
title('跟踪误差曲线');
