// cron.schedule('* * * * * *', async () => {
//   try {
//     const result = await Task.aggregate([
//       { $match: { status: 'pending' } }, 
//       { $group: { _id: '$user'} }
//     ]);

//     if (result.length === 0) {
//       return;
//     }

//     const topUserId = result[0]._id;
//     const topUser = await User.findById(topUserId);
//     if (!topUser) {
//       return;
//     }

//     const pendingTasks = await Task.find({ user: topUserId, status: 'pending' });


//     await sendEmail({
//       to: topUser.email,
//       subject: 'Your pending tasks',
//       text: 'Please see your pending tasks below.'
//     });

//     console.log(`Email sent to ${topUser.email} with ${pendingTasks.length} pending tasks.`);
//   } catch (error) {
//     console.error('Error in cron job:', error);
//   }
// });
